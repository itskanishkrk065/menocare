"""Script to create all tables and migrate all data from SQLite (menopause.db) to Neon PostgreSQL."""

import asyncio
import json
import sqlite3
from datetime import datetime, date
from sqlalchemy import text, select, inspect
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession

from backend.app.core.database import Base
import backend.app.models as models

NEON_RAW_URL = "postgresql://neondb_owner:npg_hkEws3i9tTcM@ep-twilight-voice-a1kgbfeb-pooler.ap-southeast-1.aws.neon.tech/neondb"
NEON_ASYNC_URL = "postgresql+asyncpg://neondb_owner:npg_hkEws3i9tTcM@ep-twilight-voice-a1kgbfeb-pooler.ap-southeast-1.aws.neon.tech/neondb"

TABLES_ORDER = [
    ("users", models.User),
    ("doctor_profiles", models.DoctorProfile),
    ("doctor_practice_codes", models.DoctorPracticeCode),
    ("patient_profiles", models.PatientProfile),
    ("patient_doctor_access", models.PatientDoctorAccess),
    ("questionnaire_versions", models.QuestionnaireVersion),
    ("questions", models.Question),
    ("assessments", models.Assessment),
    ("responses", models.Response),
    ("bleeding_records", models.BleedingRecord),
    ("lab_reports", models.LabReport),
    ("lab_analytes", models.LabAnalyte),
    ("anomaly_alerts", models.AnomalyAlert),
    ("doctor_clinical_notes", models.DoctorClinicalNote),
    ("appointment_requests", models.AppointmentRequest),
    ("patient_medications", models.PatientMedication),
    ("medication_logs", models.MedicationLog),
    ("patient_doctor_messages", models.PatientDoctorMessage),
    ("clinical_reports", models.ClinicalReport),
    ("audit_logs", models.AuditLog),
]


def parse_value(val, col_type):
    """Parses raw sqlite value into python type appropriate for postgres."""
    if val is None:
        return None
    type_str = str(col_type).lower()

    # JSON fields
    if "json" in type_str:
        if isinstance(val, (dict, list)):
            return val
        if isinstance(val, str):
            try:
                return json.loads(val)
            except Exception:
                return val

    # Boolean fields
    if "bool" in type_str:
        if isinstance(val, str):
            return val.lower() in ("1", "true", "t")
        return bool(val)

    # Date / DateTime fields
    if "date" in type_str or "datetime" in type_str or "timestamp" in type_str:
        if isinstance(val, (datetime, date)):
            return val
        if isinstance(val, str):
            # Parse ISO or SQLite string
            val_clean = val.replace("Z", "+00:00")
            try:
                return datetime.fromisoformat(val_clean)
            except Exception:
                try:
                    return datetime.strptime(val[:10], "%Y-%m-%d").date()
                except Exception:
                    return val

    return val


async def run_migration():
    print("1. Connecting to Neon PostgreSQL...")
    engine = create_async_engine(
        NEON_ASYNC_URL,
        connect_args={"ssl": True},
        echo=False,
    )

    print("2. Creating all schema tables on Neon PostgreSQL...")
    async with engine.begin() as conn:
        # Create tables
        await conn.run_sync(Base.metadata.create_all)
    print("Schema tables successfully created/verified on Neon!")

    print("3. Reading data from SQLite (menopause.db)...")
    sq_conn = sqlite3.connect("menopause.db")
    sq_conn.row_factory = sqlite3.Row
    sq_cur = sq_conn.cursor()

    async with AsyncSession(engine) as session:
        for tbl_name, model_cls in TABLES_ORDER:
            # Check rows in SQLite
            sq_cur.execute(f"SELECT COUNT(*) FROM {tbl_name}")
            row_count = sq_cur.fetchone()[0]
            if row_count == 0:
                print(f"  - {tbl_name}: 0 rows (skipped)")
                continue

            print(f"  - Migrating {tbl_name} ({row_count} rows)...")
            sq_cur.execute(f"SELECT * FROM {tbl_name}")
            rows = sq_cur.fetchall()

            col_types = {c.name: c.type for c in model_cls.__table__.columns}
            valid_col_names = set(col_types.keys())

            batch = []
            for row in rows:
                row_dict = dict(row)
                filtered_dict = {}
                for k, v in row_dict.items():
                    if k in valid_col_names:
                        filtered_dict[k] = parse_value(v, col_types[k])
                batch.append(filtered_dict)

            # Insert batch in chunks of 500
            chunk_size = 500
            for i in range(0, len(batch), chunk_size):
                chunk = batch[i : i + chunk_size]
                stmt = model_cls.__table__.insert().values(chunk)
                await session.execute(stmt)

            await session.commit()
            print(f"    ✓ {tbl_name}: {len(batch)} rows committed to Neon")

    print("\n4. Verifying Neon database counts:")
    async with AsyncSession(engine) as session:
        for tbl_name, model_cls in TABLES_ORDER:
            res = await session.execute(select(text("COUNT(*)")).select_from(model_cls))
            cnt = res.scalar()
            print(f"  {tbl_name}: {cnt} rows")

    print("\nMigration to Neon PostgreSQL completed successfully!")


if __name__ == "__main__":
    asyncio.run(run_migration())
