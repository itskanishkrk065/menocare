"""Main FastAPI application entry point."""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.core.database import engine, Base
from backend.app.models import QuestionnaireVersion, Question
from backend.app.clinical.instruments import MRS_QUESTIONS, DAILY_SENTINEL_ITEMS
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

# Routers
from backend.app.api.v1.auth import router as auth_router
from backend.app.api.v1.patients import router as patients_router
from backend.app.api.v1.doctors import router as doctors_router
from backend.app.api.v1.assessments import router as assessments_router
from backend.app.api.v1.labs import router as labs_router
from backend.app.api.v1.alerts import router as alerts_router
from backend.app.api.v1.analytics import router as analytics_router
from backend.app.api.v1.reports import router as reports_router
from backend.app.api.v1.medications import router as medications_router
from backend.app.api.v1.messages import router as messages_router
from backend.app.api.v1.adaptive_assessments import router as adaptive_assessments_router
from backend.app.api.v1.symptom_intake import router as symptom_intake_router
from backend.app.api.v1.clinical_anomalies import router as clinical_anomalies_router
from backend.app.api.v1.doctor_triage import router as doctor_triage_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initializes database schema and default questionnaire definitions on startup."""
    # 1. Create tables if they do not exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # 2. Seed initial questionnaire versions safely
    async with AsyncSession(engine) as session:
        try:
            # Check if daily sentinel version exists
            daily_v = await session.execute(
                select(QuestionnaireVersion).where(QuestionnaireVersion.version_code == "v1.0.0-daily-sentinel")
            )
            if not daily_v.scalar_one_or_none():
                sentinel_version = QuestionnaireVersion(
                    version_code="v1.0.0-daily-sentinel",
                    tier_type="daily_sentinel",
                    description="Daily 6-item micro-check-in assessing core vasomotor, sleep, and mood symptoms in <90s.",
                    is_active=True,
                )
                session.add(sentinel_version)
                await session.flush()

                for i, q in enumerate(DAILY_SENTINEL_ITEMS):
                    q_obj = Question(
                        version_id=sentinel_version.id,
                        code=q["code"],
                        domain=q["domain"],
                        prompt_text=q["question"],
                        input_type="likert_0_4",
                        display_order=i,
                    )
                    session.add(q_obj)

            # Check if MRS baseline version exists
            mrs_v = await session.execute(
                select(QuestionnaireVersion).where(QuestionnaireVersion.version_code == "v1.0.0-mrs-baseline")
            )
            if not mrs_v.scalar_one_or_none():
                mrs_version = QuestionnaireVersion(
                    version_code="v1.0.0-mrs-baseline",
                    tier_type="baseline_mrs",
                    description="Validated 11-item Menopause Rating Scale (MRS) across Somato-vegetative, Psychological, and Urogenital domains.",
                    is_active=True,
                )
                session.add(mrs_version)
                await session.flush()

                for i, q in enumerate(MRS_QUESTIONS):
                    q_obj = Question(
                        version_id=mrs_version.id,
                        code=q["code"],
                        domain=q["domain"],
                        prompt_text=q["text"],
                        input_type="likert_0_4",
                        display_order=i,
                    )
                    session.add(q_obj)

            await session.commit()
        except Exception as e:
            await session.rollback()
            logger.warning("Lifespan questionnaire seeding skipped: %s", e)

    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Deterministic Menopause Symptom Tracking, Local Lab Report Extraction, and Clinical Decision Support.",
    lifespan=lifespan,
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API v1 endpoints
app.include_router(auth_router, prefix=f"{settings.API_V1_STR}/auth", tags=["Authentication"])
app.include_router(patients_router, prefix=f"{settings.API_V1_STR}/patients", tags=["Patient Management"])
app.include_router(doctors_router, prefix=f"{settings.API_V1_STR}/doctors", tags=["Doctor Management"])
app.include_router(assessments_router, prefix=f"{settings.API_V1_STR}/assessments", tags=["Assessments & Check-ins"])
app.include_router(labs_router, prefix=f"{settings.API_V1_STR}/labs", tags=["Local Lab Report Extraction"])
app.include_router(alerts_router, prefix=f"{settings.API_V1_STR}/alerts", tags=["Anomaly Alerts & Appointments"])
app.include_router(analytics_router, prefix=f"{settings.API_V1_STR}/analytics", tags=["Deterministic Analytics"])
app.include_router(reports_router, prefix=f"{settings.API_V1_STR}/reports", tags=["Clinical Reports & PDF"])
app.include_router(medications_router, prefix=f"{settings.API_V1_STR}/medications", tags=["Medications & Adherence"])
app.include_router(messages_router, prefix=f"{settings.API_V1_STR}/messages", tags=["Clinical Messaging"])
app.include_router(adaptive_assessments_router, prefix=f"{settings.API_V1_STR}/adaptive", tags=["Adaptive Questionnaire Engine"])
app.include_router(symptom_intake_router, prefix=f"{settings.API_V1_STR}/symptoms", tags=["Intelligent Symptom Classification"])
app.include_router(clinical_anomalies_router, prefix=f"{settings.API_V1_STR}/anomalies", tags=["Clinical Trend Anomaly Detection"])
app.include_router(doctor_triage_router, prefix=f"{settings.API_V1_STR}/triage", tags=["Doctor Follow-up Prioritisation"])


@app.get("/health", tags=["System"])
async def health_check():
    """System health check endpoint."""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
    }


# Static Frontend & Single-Service Render Serving
import os
from pathlib import Path
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Check for built frontend in project structure
_possible_dist_dirs = [
    Path("frontend/dist"),
    Path(__file__).resolve().parent.parent.parent / "frontend" / "dist",
    Path("dist"),
]

dist_dir: Path | None = None
for p in _possible_dist_dirs:
    if p.exists() and (p / "index.html").exists():
        dist_dir = p
        break

if dist_dir:
    assets_dir = dist_dir / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    @app.api_route("/{full_path:path}", methods=["GET", "HEAD"], include_in_schema=False)
    async def serve_spa(full_path: str):
        # Don't intercept API routes, docs, or OpenAPI schema
        if (
            full_path == "api"
            or full_path.startswith("api/")
            or full_path == "docs"
            or full_path.startswith("docs/")
            or full_path == "redoc"
            or full_path.startswith("redoc/")
            or full_path.startswith("openapi.json")
        ):
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="API route not found")
        file_path = dist_dir / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(dist_dir / "index.html")
else:
    @app.get("/", tags=["System"])
    async def root():
        """API root."""
        return {
            "message": "Welcome to the AI-Based Menopause Symptom Tracking and Clinical Summary API.",
            "documentation": "/docs",
            "version": settings.VERSION,
        }
