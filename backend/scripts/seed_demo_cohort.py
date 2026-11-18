"""Seeds the database with 7 realistic 6-month synthetic patient cohorts linked to Dr. Sharma."""

import asyncio
import sys
import os
from datetime import datetime, date, timedelta, timezone

sys.path.insert(0, os.path.abspath("."))

from backend.app.core.database import async_session_maker, engine, Base
from backend.app.core.security import get_password_hash
from backend.app.models import (
    User, DoctorProfile, DoctorPracticeCode, PatientProfile, PatientDoctorAccess,
    Assessment, Response, BleedingRecord, LabReport, LabAnalyte, AnomalyAlert,
    AppointmentRequest, DoctorClinicalNote
)
from backend.app.analytics.cohort_generator import ClinicalCohortGenerator
from backend.app.analytics.anomaly import AnomalyAlertEngine


async def seed_demo_database():
    print("Reinitializing schema...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    async with async_session_maker() as db:
        # 1. Create Demo Doctor: Dr. Ananya Sharma
        doc_email = "dr.sharma@apollo.com"
        doc_user = User(
            email=doc_email,
            hashed_password=get_password_hash("Password123#"),
            full_name="Dr. Ananya Sharma",
            role="doctor",
        )
        db.add(doc_user)
        await db.flush()

        doc_profile = DoctorProfile(
            user_id=doc_user.id,
            license_number="MED-DELHI-2016-8812",
            specialty="Gynecology & Menopausal Medicine",
            clinic_name="Apollo Center for Midlife Women's Health",
            clinic_phone="+91-11-26925858",
            clinic_address="Sarita Vihar, Delhi Mathura Road, New Delhi",
        )
        db.add(doc_profile)
        await db.flush()

        practice_code = DoctorPracticeCode(
            doctor_id=doc_profile.id,
            code="DR-SHARMA-91A",
            is_active=True,
        )
        db.add(practice_code)
        await db.flush()
        print(f"Created Doctor: {doc_user.full_name} with Practice Code: DR-SHARMA-91A")

        # 2. Generate 7 Synthetic Cohorts spanning 180 days up to TODAY
        start_date = date.today() - timedelta(days=180)
        cohorts = ClinicalCohortGenerator.generate_all_cohorts(start_date=start_date, days=180)

        seeded_patient_ids = []

        for idx, (cohort_key, cohort_data) in enumerate(cohorts.items(), start=1):
            patient_email = f"patient{idx}@menocare.com"
            patient_user = User(
                email=patient_email,
                hashed_password=get_password_hash("Password123#"),
                full_name=cohort_data["name"].split(": ")[-1],
                role="patient",
            )
            db.add(patient_user)
            await db.flush()

            patient_profile = PatientProfile(
                user_id=patient_user.id,
                birth_year=2026 - cohort_data["age"],
                straw_stage=cohort_data["straw_stage"],
                surgical_history={"amenorrhea_days": cohort_data.get("amenorrhea_days", 0)},
            )
            db.add(patient_profile)
            await db.flush()

            # Link patient to Dr. Sharma
            link = PatientDoctorAccess(
                patient_id=patient_profile.id,
                doctor_id=doc_profile.id,
                linked_via_code="DR-SHARMA-91A",
                status="active",
            )
            db.add(link)

            # Insert daily records
            daily_by_date = {}
            for r in cohort_data["daily_records"]:
                daily_by_date.setdefault(r["date"], []).append(r)

            for d_str, responses in daily_by_date.items():
                d_obj = datetime.strptime(d_str, "%Y-%m-%d").date()
                assessment = Assessment(
                    patient_id=patient_profile.id,
                    assessment_date=d_obj,
                )
                db.add(assessment)
                await db.flush()

                for resp in responses:
                    r_obj = Response(
                        assessment_id=assessment.id,
                        question_code=resp["question_code"],
                        intensity=resp["intensity"],
                        notes=resp.get("notes"),
                    )
                    db.add(r_obj)

            # Insert bleeding records
            for b in cohort_data["bleeding_records"]:
                b_obj = BleedingRecord(
                    patient_id=patient_profile.id,
                    record_date=datetime.strptime(b["record_date"], "%Y-%m-%d").date(),
                    status=b["status"],
                    duration_days=b["duration_days"],
                    has_clots=b["has_clots"],
                    basal_body_temp=b.get("basal_body_temp"),
                    pelvic_pain_intensity=b.get("pelvic_pain_intensity", 0),
                )
                db.add(b_obj)

            # Insert verified lab reports if present
            if cohort_data["verified_labs"]:
                lab_report = LabReport(
                    patient_id=patient_profile.id,
                    file_name="Confirmed_Biochemical_Panel.pdf",
                    file_path="/app/backend/uploads/sample.pdf",
                    mime_type="application/pdf",
                    report_date=datetime.now().date(),
                    status="verified",
                )
                db.add(lab_report)
                await db.flush()

                for analyte_name, val in cohort_data["verified_labs"].items():
                    a_obj = LabAnalyte(
                        lab_report_id=lab_report.id,
                        analyte_name=analyte_name,
                        numeric_value=val,
                        flag="high" if val > 20 else "normal",
                        is_verified_by_user=True,
                    )
                    db.add(a_obj)

            # Evaluate and persist alerts
            alerts = AnomalyAlertEngine.check_for_anomalies(
                patient_id=patient_profile.id,
                doctor_id=doc_profile.id,
                doctor_name=doc_user.full_name,
                patient_age=cohort_data["age"],
                straw_stage=cohort_data["straw_stage"],
                daily_records=cohort_data["daily_records"],
                bleeding_records=cohort_data["bleeding_records"],
                verified_labs=cohort_data["verified_labs"],
                total_recorded_days=len(daily_by_date),
                amenorrhea_days=cohort_data.get("amenorrhea_days", 0),
            )

            seeded_patient_ids.append((idx, patient_profile.id, patient_user.full_name))

            for a_data in alerts:
                alert_obj = AnomalyAlert(**a_data)
                db.add(alert_obj)

            print(f"Seeded Patient {idx}: {patient_user.full_name} ({len(daily_by_date)} days logged, {len(alerts)} alerts)")

        # 3. Seed demo appointments and consultation notes
        p4_id = next(pid for idx, pid, name in seeded_patient_ids if idx == 4)
        p2_id = next(pid for idx, pid, name in seeded_patient_ids if idx == 2)
        p5_id = next(pid for idx, pid, name in seeded_patient_ids if idx == 5)

        # Appointment 1: Today for Patient 4 (Urgent PMB)
        appt1 = AppointmentRequest(
            patient_id=p4_id,
            doctor_id=doc_profile.id,
            requested_date=date.today(),
            reason="URGENT: Sudden postmenopausal spotting after 24m amenorrhea. Immediate TVUS referral consultation.",
            status="confirmed",
            meeting_link="https://meet.jit.si/MenoCare-PMB-Emergency",
        )
        db.add(appt1)

        # Appointment 2: Tomorrow for Patient 2 (PCOD)
        appt2 = AppointmentRequest(
            patient_id=p2_id,
            doctor_id=doc_profile.id,
            requested_date=date.today() + timedelta(days=1),
            reason="PCOD differential review: 10-day bleeding episodes & hyperthermic basal temperature review.",
            status="pending",
        )
        db.add(appt2)

        # Appointment 3: Next week for Patient 5 (Fibroids / Anemia)
        appt3 = AppointmentRequest(
            patient_id=p5_id,
            doctor_id=doc_profile.id,
            requested_date=date.today() + timedelta(days=5),
            reason="Review repeat CBC and Serum Ferritin; discuss oral vs IV iron therapy for symptomatic anemia.",
            status="confirmed",
            meeting_link="https://meet.jit.si/MenoCare-Fibroids-Review",
        )
        db.add(appt3)

        # Seed SOAP Note for Patient 4
        soap_note = DoctorClinicalNote(
            patient_id=p4_id,
            doctor_id=doc_profile.id,
            note_type="soap",
            subjective="55yo postmenopausal female presenting with fresh red vaginal spotting ongoing for 48 hours. Menopause occurred 2.5 years ago. Denies HRT use, tamoxifen, or abdominal trauma.",
            objective="BP 124/82 mmHg, HR 72 bpm, afebrile. Abdomen soft, non-tender, no palpable adnexal masses.",
            assessment="Postmenopausal Bleeding (RED_PMB). High-priority clinical red flag requiring urgent exclusion of endometrial hyperplasia / malignancy.",
            plan="1. Ordered urgent Transvaginal Ultrasound (TVUS) to assess endometrial stripe thickness (cutoff 4mm).\n2. Endometrial pipelle biopsy if stripe >= 4mm.\n3. Prescribed symptomatic precautions and red-flag warning signs.",
        )
        db.add(soap_note)

        await db.commit()
        print("\nDatabase seeding completed successfully.")


if __name__ == "__main__":
    asyncio.run(seed_demo_database())
