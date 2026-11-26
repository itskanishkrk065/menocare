"""Integration tests for Individual Patient Profile, timeline feeds, notes, and patient switching."""

import uuid
from datetime import date
import pytest
from httpx import AsyncClient, ASGITransport
from backend.app.main import app
from backend.app.core.database import engine, Base


@pytest.fixture(autouse=True)
async def init_db():
    """Initializes tables before test run."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    yield


@pytest.mark.asyncio
async def test_patient_profile_timeline_notes_and_isolation():
    """Tests patient profile loading, timeline event aggregation (including labs & notes),

    and strict patient data isolation upon patient switching.
    """
    uid = str(uuid.uuid4())[:8]
    doc_email = f"dr.vance_{uid}@menocare.com"
    pat1_email = f"elena.rostova_{uid}@testmail.com"
    pat2_email = f"maria.santos_{uid}@testmail.com"

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Register Doctor
        doc_resp = await client.post(
            "/api/v1/auth/register",
            json={
                "email": doc_email,
                "password": "Password123#Secure",
                "full_name": "Dr. Elena Vance",
                "role": "doctor",
                "license_number": "MED-NY-2022-8812",
                "clinic_name": "MenoCare Endocrine Command",
                "clinic_phone": "+1-555-0199",
            },
        )
        assert doc_resp.status_code == 201
        doc_token = doc_resp.json()["access_token"]

        # Get Doctor Practice Code
        code_resp = await client.get(
            "/api/v1/doctors/practice-code",
            headers={"Authorization": f"Bearer {doc_token}"},
        )
        assert code_resp.status_code == 200
        code = code_resp.json()["code"]

        # 2. Register Patient 1 (Elena)
        pat1_resp = await client.post(
            "/api/v1/auth/register",
            json={
                "email": pat1_email,
                "password": "Password123#Secure",
                "full_name": "Elena Rostova",
                "role": "patient",
                "birth_year": 1978,
            },
        )
        assert pat1_resp.status_code == 201
        pat1_token = pat1_resp.json()["access_token"]

        # Pair Patient 1 with Doctor
        link1 = await client.post(
            "/api/v1/patients/link-doctor",
            json={"practice_code": code},
            headers={"Authorization": f"Bearer {pat1_token}"},
        )
        assert link1.status_code == 200

        # Get Patient 1 Profile to retrieve patient_id
        p1_prof = await client.get("/api/v1/patients/profile", headers={"Authorization": f"Bearer {pat1_token}"})
        p1_id = p1_prof.json()["id"]

        # 3. Register Patient 2 (Maria)
        pat2_resp = await client.post(
            "/api/v1/auth/register",
            json={
                "email": pat2_email,
                "password": "Password123#Secure",
                "full_name": "Maria Santos",
                "role": "patient",
                "birth_year": 1974,
            },
        )
        assert pat2_resp.status_code == 201
        pat2_token = pat2_resp.json()["access_token"]

        # Pair Patient 2 with Doctor
        link2 = await client.post(
            "/api/v1/patients/link-doctor",
            json={"practice_code": code},
            headers={"Authorization": f"Bearer {pat2_token}"},
        )
        assert link2.status_code == 200

        p2_prof = await client.get("/api/v1/patients/profile", headers={"Authorization": f"Bearer {pat2_token}"})
        p2_id = p2_prof.json()["id"]

        # 4. Patient 1 Logs a Daily Assessment
        checkin_resp = await client.post(
            "/api/v1/assessments/daily",
            headers={"Authorization": f"Bearer {pat1_token}"},
            json={
                "assessment_date": str(date.today()),
                "responses": [
                    {"question_code": "VM_HF", "intensity": 3, "frequency_count": 4, "functional_impact": 2},
                    {"question_code": "SL_SQ", "intensity": 3, "frequency_count": 0, "functional_impact": 2},
                ],
                "bleeding_status": "spotting",
                "duration_days": 2,
                "has_clots": False,
                "pelvic_pain_intensity": 1,
            },
        )
        assert checkin_resp.status_code == 200

        # 5. Doctor posts a SOAP Clinical Note for Patient 1
        note_resp = await client.post(
            f"/api/v1/doctors/patients/{p1_id}/notes",
            headers={"Authorization": f"Bearer {doc_token}"},
            json={
                "note_type": "soap",
                "subjective": "Patient reports severe nocturnal hot flashes.",
                "objective": "Vitals: BP 118/76, HR 72. BMI 24.2.",
                "assessment": "Late perimenopause transition (STRAW -1).",
                "plan": "Prescribe oral micronized progesterone 100mg QHS.",
            },
        )
        assert note_resp.status_code == 200
        assert "id" in note_resp.json()

        # 6. Verify Doctor lists Patient 1's SOAP notes
        notes_list = await client.get(
            f"/api/v1/doctors/patients/{p1_id}/notes",
            headers={"Authorization": f"Bearer {doc_token}"},
        )
        assert notes_list.status_code == 200
        notes_data = notes_list.json()
        assert len(notes_data) == 1
        assert "progesterone" in notes_data[0]["plan"]

        # 7. Verify Patient 1's Timeline Feed contains checkin and note
        timeline_p1 = await client.get(
            f"/api/v1/doctors/patients/{p1_id}/timeline",
            headers={"Authorization": f"Bearer {doc_token}"},
        )
        assert timeline_p1.status_code == 200
        p1_events = timeline_p1.json()
        types_p1 = [e["type"] for e in p1_events]
        assert "checkin" in types_p1
        assert "doctor_note" in types_p1

        # 8. Verify STRICT Patient Isolation (Patient 2 must have 0 notes and 0 check-ins)
        timeline_p2 = await client.get(
            f"/api/v1/doctors/patients/{p2_id}/timeline",
            headers={"Authorization": f"Bearer {doc_token}"},
        )
        assert timeline_p2.status_code == 200
        p2_events = timeline_p2.json()
        assert len(p2_events) == 0  # No events for Patient 2

        notes_p2 = await client.get(
            f"/api/v1/doctors/patients/{p2_id}/notes",
            headers={"Authorization": f"Bearer {doc_token}"},
        )
        assert notes_p2.status_code == 200
        assert len(notes_p2.json()) == 0  # Patient 2 has zero notes

        # 9. Verify Doctor can access lab reports for Patient 1
        labs_p1 = await client.get(
            f"/api/v1/labs/reports?patient_id={p1_id}",
            headers={"Authorization": f"Bearer {doc_token}"},
        )
        assert labs_p1.status_code == 200
        assert isinstance(labs_p1.json(), list)
