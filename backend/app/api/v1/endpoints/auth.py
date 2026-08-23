import random
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.models.user import User
from backend.app.schemas.auth import (
    UserSignupRequest,
    UserLoginRequest,
    UserResponse,
    TokenResponse,
    RefreshTokenRequest,
    TokenRefreshResponse,
)
from backend.app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
    get_current_user,
)
from backend.app.core.config import settings
from backend.app.core.logging import logger

router = APIRouter()


def _generate_unique_patient_id(db: Session) -> str:
    """Generates a unique patient identifier (e.g., PAT-2026-4891)."""
    current_year = datetime.now().year
    for _ in range(50):
        candidate = f"PAT-{current_year}-{random.randint(1000, 9999)}"
        if not db.query(User).filter(User.patient_id == candidate).first():
            return candidate
    return f"PAT-{current_year}-{random.randint(10000, 99999)}"


def _generate_unique_record_number(db: Session) -> str:
    """Generates a unique record number (e.g., REC-58291)."""
    for _ in range(50):
        candidate = f"REC-{random.randint(10000, 99999)}"
        if not db.query(User).filter(User.record_number == candidate).first():
            return candidate
    return f"REC-{random.randint(100000, 999999)}"


@router.post(
    "/signup",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="User / Patient Registration (Auto-Generates Patient ID & Record No)",
)
def signup_user(
    payload: UserSignupRequest,
    response: Response,
    db: Session = Depends(get_db),
):
    """
    Registers a new user/patient/clinician:
    - Validates uniqueness for both email and phone_number.
    - Automatically generates a unique Patient ID and Record Number.
    - Hashes password using salted bcrypt.
    - Persists user entity in database.
    - Issues signed JWT token and sets secure HttpOnly cookie.
    """
    # 1. Check uniqueness for email
    existing_email = db.query(User).filter(User.email == payload.email.lower()).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists.",
        )

    # 2. Check uniqueness for phone_number
    if payload.phone_number:
        clean_phone = payload.phone_number.strip()
        existing_phone = db.query(User).filter(User.phone_number == clean_phone).first()
        if existing_phone:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this phone number already exists.",
            )
    else:
        clean_phone = None

    # 3. Automatically generate unique Patient ID & Record Number
    generated_patient_id = _generate_unique_patient_id(db)
    generated_record_number = _generate_unique_record_number(db)

    # 4. Create persistent user entity
    full_name = f"{payload.first_name.strip()} {payload.last_name.strip()}".strip()
    hashed_pwd = get_password_hash(payload.password)

    new_user = User(
        email=payload.email.lower().strip(),
        phone_number=clean_phone,
        patient_id=generated_patient_id,
        record_number=generated_record_number,
        hashed_password=hashed_pwd,
        first_name=payload.first_name.strip(),
        last_name=payload.last_name.strip(),
        full_name=full_name,
        age=payload.age,
        gender=payload.gender,
        address=payload.address,
        role=payload.role or "Patient",
        npi_number=payload.npi_number,
        wallet_address=payload.wallet_address,
        is_active=True,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    logger.info(
        f"New user registered: {new_user.email} (Patient ID: {new_user.patient_id}, Record No: {new_user.record_number})"
    )

    # 5. Generate JWT access (1 hr) & refresh (20 days) tokens
    access_token = create_access_token(
        subject=str(new_user.id),
        extra_claims={
            "email": new_user.email,
            "role": new_user.role,
            "phone_number": new_user.phone_number,
            "patient_id": new_user.patient_id,
            "record_number": new_user.record_number,
        },
    )
    refresh_token = create_refresh_token(subject=str(new_user.id))

    # 6. Set secure cookies
    response.set_cookie(
        key="trustmed_access_token",
        value=access_token,
        httponly=True,
        samesite="lax",
        secure=not settings.DEBUG,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )
    response.set_cookie(
        key="trustmed_refresh_token",
        value=refresh_token,
        httponly=True,
        samesite="lax",
        secure=not settings.DEBUG,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600,
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserResponse.model_validate(new_user),
    )


@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="User Authentication (Login Gateway)",
)
def login_user(
    payload: UserLoginRequest,
    response: Response,
    db: Session = Depends(get_db),
):
    """
    Authenticates a user via phone_number (or email) and password.
    - Verifies password hash against database credentials.
    - Returns Bearer JWT access token (1 hr) and refresh token (20 days) and sets HttpOnly cookies.
    """
    identifier = payload.phone_number.strip()
    
    user = (
        db.query(User).filter(User.phone_number == identifier).first()
        or db.query(User).filter(User.email == identifier.lower()).first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials. No account found with this phone number or email.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials. Incorrect password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is currently inactive. Contact system administrator.",
        )

    # Ensure patient_id exists for existing user
    if not user.patient_id:
        user.patient_id = _generate_unique_patient_id(db)
        user.record_number = _generate_unique_record_number(db)
        db.commit()
        db.refresh(user)

    # Generate JWT access (1 hr) & refresh (20 days) tokens
    access_token = create_access_token(
        subject=str(user.id),
        extra_claims={
            "email": user.email,
            "role": user.role,
            "phone_number": user.phone_number,
            "patient_id": user.patient_id,
            "record_number": user.record_number,
        },
    )
    refresh_token = create_refresh_token(subject=str(user.id))

    # Set secure HttpOnly cookies
    response.set_cookie(
        key="trustmed_access_token",
        value=access_token,
        httponly=True,
        samesite="lax",
        secure=not settings.DEBUG,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )
    response.set_cookie(
        key="trustmed_refresh_token",
        value=refresh_token,
        httponly=True,
        samesite="lax",
        secure=not settings.DEBUG,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600,
    )

    logger.info(f"User logged in: {user.email} (Patient ID: {user.patient_id})")

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserResponse.model_validate(user),
    )


@router.post(
    "/refresh",
    response_model=TokenRefreshResponse,
    status_code=status.HTTP_200_OK,
    summary="Refresh JWT Access Token using 20-day Refresh Token",
)
def refresh_access_token(
    response: Response,
    payload: Optional[RefreshTokenRequest] = None,
    db: Session = Depends(get_db),
    request: Request = None,
):
    """
    Exchanges a valid 20-day refresh token for a fresh 1-hour access token.
    Reads token from request body or 'trustmed_refresh_token' HttpOnly cookie.
    """
    token_str = None
    if payload and payload.refresh_token:
        token_str = payload.refresh_token.strip()
    elif request:
        token_str = request.cookies.get("trustmed_refresh_token")

    if not token_str:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token was not provided.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    decoded = decode_refresh_token(token_str)
    if not decoded or "sub" not in decoded:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token. Please sign in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = decoded["sub"]
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account inactive or not found.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Issue new 1-hour access token and updated 20-day refresh token
    new_access_token = create_access_token(
        subject=str(user.id),
        extra_claims={
            "email": user.email,
            "role": user.role,
            "phone_number": user.phone_number,
            "patient_id": user.patient_id,
            "record_number": user.record_number,
        },
    )
    new_refresh_token = create_refresh_token(subject=str(user.id))

    response.set_cookie(
        key="trustmed_access_token",
        value=new_access_token,
        httponly=True,
        samesite="lax",
        secure=not settings.DEBUG,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )
    response.set_cookie(
        key="trustmed_refresh_token",
        value=new_refresh_token,
        httponly=True,
        samesite="lax",
        secure=not settings.DEBUG,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600,
    )

    logger.info(f"Access token successfully refreshed for {user.email}")

    return TokenRefreshResponse(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserResponse.model_validate(user),
    )


@router.post(
    "/logout",
    status_code=status.HTTP_200_OK,
    summary="User Logout & Session Invalidation",
)
def logout_user(response: Response):
    """Clears authentication session cookies."""
    response.delete_cookie(key="trustmed_access_token")
    response.delete_cookie(key="trustmed_refresh_token")
    return {"message": "Session invalidated successfully."}


@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Authenticated User Profile",
)
def get_current_user_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Returns the authenticated user's profile with Patient ID and Record No."""
    if not current_user.patient_id:
        current_user.patient_id = _generate_unique_patient_id(db)
        current_user.record_number = _generate_unique_record_number(db)
        db.commit()
        db.refresh(current_user)
    return UserResponse.model_validate(current_user)
