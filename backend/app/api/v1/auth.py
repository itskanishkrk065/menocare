"""Authentication and registration endpoints."""

import random
import string
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.app.core.database import get_db
from backend.app.core.security import verify_password, get_password_hash, create_access_token
from backend.app.models import (
    User,
    PatientProfile,
    DoctorProfile,
    DoctorPracticeCode,
    PatientDoctorAccess,
)
from backend.app.schemas import UserCreate, UserLogin, Token, UserResponse
from backend.app.api.deps import get_current_user

router = APIRouter()


def _generate_practice_code(doctor_name: str) -> str:
    """Generates an alphanumeric practice code like 'DR-KUMAR-7X9'."""
    clean_name = "".join(c for c in doctor_name if c.isalpha()).upper()[:5] or "DOC"
    random_suffix = "".join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f"DR-{clean_name}-{random_suffix}"


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    """Registers a new user (patient or doctor) and creates their initial profile."""
    # Check if email is already registered
    existing = await db.execute(select(User).where(User.email == user_in.email))
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists.",
        )

    # Create User record
    user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        role=user_in.role,
        full_name=user_in.full_name,
    )
    db.add(user)
    await db.flush()

    profile_id = None

    if user.role == "patient":
        surg_hist = user_in.surgical_history or {}
        if user_in.amenorrhea_days:
            surg_hist["amenorrhea_days"] = user_in.amenorrhea_days
        if user_in.prior_conditions:
            surg_hist["prior_conditions"] = user_in.prior_conditions

        patient_profile = PatientProfile(
            user_id=user.id,
            birth_year=user_in.birth_year or 1978,
            straw_stage=user_in.straw_stage or "early_transition",
            surgical_history=surg_hist,
            current_medications=user_in.current_medications or [],
        )
        db.add(patient_profile)
        await db.flush()
        profile_id = patient_profile.id

        # If a practice code was provided, link patient to doctor automatically
        if user_in.doctor_practice_code:
            code_str = user_in.doctor_practice_code.strip().upper()
            code_res = await db.execute(
                select(DoctorPracticeCode).where(
                    DoctorPracticeCode.code == code_str,
                    DoctorPracticeCode.is_active == True,
                )
            )
            found_code = code_res.scalar_one_or_none()
            if found_code:
                link = PatientDoctorAccess(
                    patient_id=patient_profile.id,
                    doctor_id=found_code.doctor_id,
                    status="active",
                )
                db.add(link)

    elif user.role == "doctor":
        doctor_profile = DoctorProfile(
            user_id=user.id,
            license_number=user_in.license_number or "MED-REG-PENDING",
            clinic_name=user_in.clinic_name or "Women's Health & Menopause Clinic",
            clinic_phone=user_in.clinic_phone or "+1-555-0199",
        )
        db.add(doctor_profile)
        await db.flush()
        profile_id = doctor_profile.id

        # Generate practice code for doctor
        code = _generate_practice_code(user.full_name)
        practice_code = DoctorPracticeCode(
            doctor_id=doctor_profile.id,
            code=code,
            is_active=True,
        )
        db.add(practice_code)

    await db.commit()

    # Generate JWT access token
    access_token = create_access_token(subject=user.id, role=user.role)
    return Token(
        access_token=access_token,
        user_id=user.id,
        role=user.role,
        full_name=user.full_name,
        profile_id=profile_id,
    )


@router.post("/login", response_model=Token)
async def login(login_in: UserLogin, db: AsyncSession = Depends(get_db)):
    """Authenticates user credentials and returns JWT token."""
    clean_email = login_in.email.strip().lower()
    
    result = await db.execute(select(User).where(User.email == clean_email))
    user = result.scalar_one_or_none()

    # Friendly alias fallback for demo convenience
    if not user:
        if clean_email in ["doctor@menocare.com", "doctor2@menocare.com", "dr.sharma@menocare.com"]:
            result = await db.execute(select(User).where(User.email == "dr.sharma@apollo.com"))
            user = result.scalar_one_or_none()

    if not user or not verify_password(login_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is deactivated.")

    profile_id = None
    if user.role == "patient":
        p_res = await db.execute(select(PatientProfile).where(PatientProfile.user_id == user.id))
        p = p_res.scalar_one_or_none()
        profile_id = p.id if p else None
    elif user.role == "doctor":
        d_res = await db.execute(select(DoctorProfile).where(DoctorProfile.user_id == user.id))
        d = d_res.scalar_one_or_none()
        profile_id = d.id if d else None

    access_token = create_access_token(subject=user.id, role=user.role)
    return Token(
        access_token=access_token,
        user_id=user.id,
        role=user.role,
        full_name=user.full_name,
        profile_id=profile_id,
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Returns profile details of authenticated user."""
    return current_user
