"""100% Local lab report upload and extraction endpoints."""

import os
import shutil
from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from backend.app.core.config import settings
from backend.app.core.database import get_db
from backend.app.models import (
    User, PatientProfile, LabReport, LabAnalyte, AuditLog,
    PatientDoctorAccess, DoctorProfile, Assessment, Response, BleedingRecord, AnomalyAlert
)
from backend.app.schemas import LabReportResponse, VerifyLabReportRequest
from backend.app.services.local_ocr import LocalOCRExtractionEngine
from backend.app.analytics.anomaly import AnomalyAlertEngine
from backend.app.api.deps import get_current_user, get_current_patient

router = APIRouter()


@router.post("/upload", response_model=LabReportResponse, status_code=status.HTTP_201_CREATED)
async def upload_lab_report(
    file: UploadFile = File(...),
    patient: PatientProfile = Depends(get_current_patient),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Uploads a scanned lab report and extracts blood test analytes locally via Tesseract / pdfplumber."""
    allowed_types = ["application/pdf", "image/png", "image/jpeg", "image/jpg", "image/tiff"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type '{file.content_type}'. Please upload a PDF or image (PNG/JPG).",
        )

    # Save file locally in secure uploads directory
    safe_filename = f"{patient.id}_{int(datetime.now().timestamp())}_{file.filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, safe_filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Run Local OCR
    raw_ocr_text = LocalOCRExtractionEngine.extract_text_from_file(file_path, file.content_type or "")
    extracted_analytes_data = LocalOCRExtractionEngine.parse_lab_analytes(raw_ocr_text)

    # Save LabReport in DB
    lab_report = LabReport(
        patient_id=patient.id,
        file_name=file.filename or "Scanned_Lab_Report.pdf",
        file_path=file_path,
        mime_type=file.content_type or "application/pdf",
        report_date=datetime.now().date(),
        status="pending_verification",
        raw_ocr_text=raw_ocr_text[:4000],  # store head for inspection
    )
    db.add(lab_report)
    await db.flush()

    # Save Extracted Analytes
    analyte_objects = []
    for item in extracted_analytes_data:
        analyte_obj = LabAnalyte(
            lab_report_id=lab_report.id,
            analyte_name=item["analyte_name"],
            numeric_value=item["numeric_value"],
            unit=item["unit"],
            reference_range_low=item["reference_range_low"],
            reference_range_high=item["reference_range_high"],
            flag=item["flag"],
            is_verified_by_user=False,
        )
        db.add(analyte_obj)
        analyte_objects.append(analyte_obj)

    # Log audit entry
    audit = AuditLog(
        actor_id=current_user.id,
        patient_id=patient.id,
        action="LOCAL_LAB_OCR_EXTRACTION",
        details=f"Extracted {len(analyte_objects)} analytes locally from {file.filename}.",
    )
    db.add(audit)
    await db.commit()

    # Reload with analytes relationship
    res = await db.execute(
        select(LabReport).where(LabReport.id == lab_report.id).options(selectinload(LabReport.analytes))
    )
    return res.scalar_one()


@router.get("/reports", response_model=List[LabReportResponse])
async def list_patient_lab_reports(
    patient: PatientProfile = Depends(get_current_patient),
    db: AsyncSession = Depends(get_db),
):
    """Lists all lab reports and their extracted analytes for the patient."""
    res = await db.execute(
        select(LabReport)
        .where(LabReport.patient_id == patient.id)
        .order_by(LabReport.created_at.desc())
        .options(selectinload(LabReport.analytes))
    )
    return res.scalars().all()


@router.put("/reports/{report_id}/verify")
async def verify_lab_report(
    report_id: str,
    payload: VerifyLabReportRequest,
    patient: PatientProfile = Depends(get_current_patient),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Human-in-the-loop verification: confirms and saves corrected lab values."""
    res = await db.execute(
        select(LabReport)
        .where(LabReport.id == report_id, LabReport.patient_id == patient.id)
        .options(selectinload(LabReport.analytes))
    )
    report = res.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lab report not found.")

    # Remove existing and replace with verified analytes
    for old_a in report.analytes:
        await db.delete(old_a)
    await db.flush()

    verified_labs_dict = {}
    for update in payload.analytes:
        a_obj = LabAnalyte(
            lab_report_id=report.id,
            analyte_name=update.analyte_name,
            numeric_value=update.numeric_value,
            unit=update.unit,
            reference_range_low=update.reference_range_low,
            reference_range_high=update.reference_range_high,
            flag=update.flag,
            is_verified_by_user=True,
        )
        db.add(a_obj)
        verified_labs_dict[update.analyte_name] = update.numeric_value

    report.status = "verified"
    await db.commit()

    # Re-evaluate anomalies with newly verified lab data
    doc_link_res = await db.execute(
        select(PatientDoctorAccess)
        .where(PatientDoctorAccess.patient_id == patient.id, PatientDoctorAccess.status == "active")
        .options(selectinload(PatientDoctorAccess.doctor).selectinload(DoctorProfile.user))
    )
    doc_link = doc_link_res.scalar_one_or_none()
    doctor_id = doc_link.doctor_id if doc_link else None
    doctor_name = doc_link.doctor.user.full_name if doc_link and doc_link.doctor and doc_link.doctor.user else None

    # Fetch daily symptoms and bleeding
    hist_resp_res = await db.execute(
        select(Response, Assessment.assessment_date)
        .join(Assessment, Response.assessment_id == Assessment.id)
        .where(Assessment.patient_id == patient.id)
    )
    daily_records_dict = [
        {"question_code": r.Response.question_code, "intensity": r.Response.intensity, "notes": r.Response.notes}
        for r in hist_resp_res.all()
    ]

    hist_bleeding_res = await db.execute(select(BleedingRecord).where(BleedingRecord.patient_id == patient.id))
    bleeding_dicts = [
        {"status": b.status, "duration_days": b.duration_days, "has_clots": b.has_clots, "basal_body_temp": b.basal_body_temp, "pelvic_pain_intensity": b.pelvic_pain_intensity}
        for b in hist_bleeding_res.scalars().all()
    ]

    new_alerts = AnomalyAlertEngine.check_for_anomalies(
        patient_id=patient.id,
        doctor_id=doctor_id,
        doctor_name=doctor_name,
        patient_age=datetime.now().year - patient.birth_year,
        straw_stage=patient.straw_stage,
        daily_records=daily_records_dict,
        bleeding_records=bleeding_dicts,
        verified_labs=verified_labs_dict,
    )

    for alert_data in new_alerts:
        existing_alert = await db.execute(
            select(AnomalyAlert).where(
                AnomalyAlert.patient_id == patient.id,
                AnomalyAlert.condition_code == alert_data["condition_code"],
                AnomalyAlert.is_acknowledged_by_patient == False,
            )
        )
        if not existing_alert.scalar_one_or_none():
            db.add(AnomalyAlert(**alert_data))

    await db.commit()

    return {
        "success": True,
        "message": f"Successfully verified {len(payload.analytes)} laboratory analytes.",
        "status": "verified",
        "new_alerts_triggered": new_alerts,
    }
