"""End-to-end API integration tests for user flows and data contracts."""

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
async def test_complete_patient_doctor_workflow():
    """Tests registration, doctor code generation, patient pairing, daily check-in, and analytics."""
    uid = str(uuid.uuid4())[:8]
    doc_email = f"dr.sharma_{uid}@testclinic.com"
    patient_email = f"priya.verma_{uid}@testmail.com"

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Register Doctor
        doc_resp = await client.post(
            "/api/v1/auth/register",
            json={
                "email": doc_email,
                "password": "Password123#Secure",
                "full_name": "Dr. Ananya Sharma",
                "role": "doctor",
                "license_number": "MED-DL-2018-9921",
                "clinic_name": "Apollo Women's Health Clinic",
                "clinic_phone": "+91-9876543210",
            },
        )
        assert doc_resp.status_code == 201
        doc_data = doc_resp.json()
        doc_token = doc_data["access_token"]
        assert doc_data["role"] == "doctor"

        # 2. Get Doctor's Practice Code
        code_resp = await client.get(
            "/api/v1/doctors/practice-code",
            headers={"Authorization": f"Bearer {doc_token}"},
        )
        assert code_resp.status_code == 200
        practice_code = code_resp.json()["code"]
        assert practice_code.startswith("DR-")

        # 3. Register Patient
        patient_resp = await client.post(
            "/api/v1/auth/register",
            json={
                "email": patient_email,
                "password": "Password123#Secure",
                "full_name": "Priya Verma",
                "role": "patient",
                "birth_year": 1979,
            },
        )
        assert patient_resp.status_code == 201
        patient_data = patient_resp.json()
        patient_token = patient_data["access_token"]
        assert patient_data["role"] == "patient"

        # 4. Patient Links to Doctor via Practice Code
        link_resp = await client.post(
            "/api/v1/patients/link-doctor",
            headers={"Authorization": f"Bearer {patient_token}"},
            json={"practice_code": practice_code},
        )
        assert link_resp.status_code == 200
        assert "Ananya Sharma" in link_resp.json()["doctor_name"]

        # 5. Doctor views authorized patient list
        doc_patients_resp = await client.get(
            "/api/v1/doctors/patients",
            headers={"Authorization": f"Bearer {doc_token}"},
        )
        assert doc_patients_resp.status_code == 200
        patients_list = doc_patients_resp.json()
        assert len(patients_list) >= 1
        assert any(p["full_name"] == "Priya Verma" for p in patients_list)

        # 6. Patient submits daily sentinel check-in with today's date
        today_str = str(date.today())
        checkin_resp = await client.post(
            "/api/v1/assessments/daily",
            headers={"Authorization": f"Bearer {patient_token}"},
            json={
                "assessment_date": today_str,
                "responses": [
                    {"question_code": "VM_HF", "intensity": 3, "frequency_count": 5, "functional_impact": 2},
                    {"question_code": "VM_NS", "intensity": 3, "frequency_count": 2, "functional_impact": 2},
                    {"question_code": "SL_SQ", "intensity": 3, "frequency_count": 0, "functional_impact": 2},
                    {"question_code": "PS_MD", "intensity": 2, "frequency_count": 0, "functional_impact": 1},
                    {"question_code": "PS_AX", "intensity": 2, "frequency_count": 0, "functional_impact": 1},
                    {"question_code": "PH_FT", "intensity": 3, "frequency_count": 0, "functional_impact": 2},
                ],
                "bleeding_status": "heavy",
                "duration_days": 8,
                "has_clots": True,
                "basal_body_temp": 37.3,
                "pelvic_pain_intensity": 2,
                "additional_symptom_notes": "Noticed increased facial hair and continuous bleeding.",
            },
        )
        assert checkin_resp.status_code == 200
        checkin_data = checkin_resp.json()
        assert checkin_data["success"] is True

        # 7. Patient queries analytics time-series charts
        chart_resp = await client.get(
            "/api/v1/analytics/charts?days=30",
            headers={"Authorization": f"Bearer {patient_token}"},
        )
        assert chart_resp.status_code == 200
        chart_data = chart_resp.json()
        assert "VM_HF" in chart_data["time_series_data"]
        assert chart_data["total_recorded_days"] >= 1

        # 8. Patient queries differential screening results
        diff_resp = await client.get(
            "/api/v1/analytics/differential",
            headers={"Authorization": f"Bearer {patient_token}"},
        )
        assert diff_resp.status_code == 200
        diff_data = diff_resp.json()
        assert "screenings" in diff_data

        # 9. Generate Clinical Summary
        summary_resp = await client.post(
            "/api/v1/reports/generate?days=30",
            headers={"Authorization": f"Bearer {patient_token}"},
        )
        assert summary_resp.status_code == 200
        summary_data = summary_resp.json()
        assert "executive_overview" in summary_data["ai_summary"]
        assert "primary_symptom_drivers" in summary_data["ai_summary"]

        # 10. Download Clinical PDF Report
        pdf_resp = await client.get(
            "/api/v1/reports/download-pdf?days=30",
            headers={"Authorization": f"Bearer {patient_token}"},
        )
        assert pdf_resp.status_code == 200
        assert pdf_resp.headers["content-type"] == "application/pdf"
        assert len(pdf_resp.content) > 1000  # valid binary PDF payload
