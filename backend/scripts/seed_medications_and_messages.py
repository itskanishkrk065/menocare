"""Seeds sample medications, adherence records, and clinical message threads for demo patients."""

import asyncio
from datetime import date, timedelta
from backend.app.core.database import async_session_maker, engine, Base
from backend.app.models import User, PatientProfile, DoctorProfile, PatientMedication, MedicationLog, PatientDoctorMessage
from sqlalchemy import select

SAMPLE_MEDS = [
    {
        "name": "17β-Estradiol Transdermal Patch",
        "dosage": "50 µg/24h",
        "frequency": "twice_weekly",
        "category": "hrt",
        "instructions": "Apply to lower abdomen or buttocks on Mondays & Thursdays.",
    },
    {
        "name": "Micronized Progesterone (Utrogestan)",
        "dosage": "100 mg",
        "frequency": "nightly",
        "category": "hrt",
        "instructions": "Take at bedtime with water for continuous endometrial protection.",
    },
    {
        "name": "Elemental Calcium + Vitamin D3",
        "dosage": "1200 mg / 1000 IU",
        "frequency": "daily",
        "category": "bone_density",
        "instructions": "Take with breakfast for perimenopausal bone matrix density.",
    },
    {
        "name": "Magnesium Glycinate",
        "dosage": "300 mg",
        "frequency": "nightly",
        "category": "supplement",
        "instructions": "Take 30 minutes before sleep for muscle relaxation and sleep continuity.",
    },
]

SAMPLE_MESSAGES = [
    {
        "sender_role": "doctor",
        "message_text": "Good morning Sarah, I reviewed your 30-day symptom chart. Your hot flash frequency has stabilized nicely since initiating the transdermal patch. Let's monitor sleep quality over the next two weeks.",
    },
    {
        "sender_role": "patient",
        "message_text": "Thank you Dr. Sharma! Yes, the night sweats have decreased significantly. I had one flush after drinking tea yesterday, but sleep is much deeper.",
    },
    {
        "sender_role": "doctor",
        "message_text": "Wonderful news. Keep logging your daily check-in and remember to take the micronized progesterone right at bedtime.",
    },
]


async def seed():
    # Ensure tables are created
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session_maker() as session:
        # Get Patient 1 and Doctor
        p1_res = await session.execute(select(PatientProfile).join(User).where(User.email == "patient1@menocare.com"))
        patient1 = p1_res.scalar_one_or_none()

        doc_res = await session.execute(select(DoctorProfile).join(User).where(User.email == "dr.sharma@apollo.com"))
        doctor = doc_res.scalar_one_or_none()

        if not patient1 or not doctor:
            print("Demo users not found. Run seed_demo_cohort.py first.")
            return

        # Check existing meds
        existing_meds = await session.execute(select(PatientMedication).where(PatientMedication.patient_id == patient1.id))
        if len(existing_meds.scalars().all()) == 0:
            print(f"Seeding medications for {patient1.id}...")
            created_meds = []
            for m in SAMPLE_MEDS:
                med = PatientMedication(
                    patient_id=patient1.id,
                    name=m["name"],
                    dosage=m["dosage"],
                    frequency=m["frequency"],
                    category=m["category"],
                    instructions=m["instructions"],
                    is_active=True,
                )
                session.add(med)
                created_meds.append(med)
            await session.flush()

            # Seed past 14 days of logs for realistic compliance (92% adherence)
            today = date.today()
            for day_offset in range(14):
                log_day = today - timedelta(days=day_offset)
                for med in created_meds:
                    # 90% chance taken
                    if day_offset % 7 != 3:  # miss one day per week for realistic adherence
                        mlog = MedicationLog(
                            medication_id=med.id,
                            patient_id=patient1.id,
                            log_date=log_day,
                            taken=True,
                        )
                        session.add(mlog)

        # Check existing messages
        existing_msgs = await session.execute(
            select(PatientDoctorMessage).where(
                PatientDoctorMessage.patient_id == patient1.id,
                PatientDoctorMessage.doctor_id == doctor.id,
            )
        )
        if len(existing_msgs.scalars().all()) == 0:
            print("Seeding clinical messages...")
            for msg_data in SAMPLE_MESSAGES:
                msg = PatientDoctorMessage(
                    patient_id=patient1.id,
                    doctor_id=doctor.id,
                    sender_role=msg_data["sender_role"],
                    message_text=msg_data["message_text"],
                    is_read=True,
                )
                session.add(msg)

        await session.commit()
        print("Medications and messages seeded successfully!")


if __name__ == "__main__":
    asyncio.run(seed())
