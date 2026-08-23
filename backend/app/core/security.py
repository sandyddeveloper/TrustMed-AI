from datetime import datetime, timedelta, timezone
from typing import Any, Union, Optional, Dict
from jose import jwt, JWTError
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from backend.app.core.config import settings
from backend.app.db.session import get_db
from backend.app.models.user import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
ALGORITHM = "HS256"

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login",
    auto_error=False,
)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against the stored hash."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Generate bcrypt password hash."""
    return pwd_context.hash(password)


def create_access_token(
    subject: Union[str, Any],
    expires_delta: Union[timedelta, None] = None,
    extra_claims: Optional[Dict[str, Any]] = None,
) -> str:
    """Generate JWT access token."""
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )

    to_encode = {"exp": expire, "sub": str(subject)}
    if extra_claims:
        to_encode.update(extra_claims)
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def create_refresh_token(
    subject: Union[str, Any],
    expires_delta: Union[timedelta, None] = None,
) -> str:
    """Generate JWT refresh token with 20-day default validity."""
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            days=settings.REFRESH_TOKEN_EXPIRE_DAYS
        )

    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "token_type": "refresh",
    }
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decode and validate a JWT access token."""
    try:
        if not token:
            return None
        cleaned_token = str(token).strip()
        if cleaned_token.lower().startswith("bearer "):
            cleaned_token = cleaned_token[7:].strip()
        if cleaned_token.startswith('"') and cleaned_token.endswith('"'):
            cleaned_token = cleaned_token[1:-1].strip()
        payload = jwt.decode(cleaned_token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None


def decode_refresh_token(token: str) -> Optional[Dict[str, Any]]:
    """Decode and validate a JWT refresh token."""
    try:
        if not token:
            return None
        cleaned_token = str(token).strip()
        if cleaned_token.lower().startswith("bearer "):
            cleaned_token = cleaned_token[7:].strip()
        if cleaned_token.startswith('"') and cleaned_token.endswith('"'):
            cleaned_token = cleaned_token[1:-1].strip()
        payload = jwt.decode(cleaned_token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("token_type") != "refresh":
            return None
        return payload
    except JWTError:
        return None


def get_current_user(
    request: Request,
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    Extracts and validates user from Authorization header or 'trustmed_access_token' cookie.
    """
    auth_token = token
    if not auth_token:
        # Fallback to cookie
        auth_token = request.cookies.get("trustmed_access_token")

    if not auth_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = decode_access_token(auth_token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Lookup user by email or id
    user = None
    if str(user_id).isdigit():
        user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        user = db.query(User).filter(User.email == str(user_id)).first()
    if not user:
        user = db.query(User).filter(User.phone_number == str(user_id)).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User associated with token not found.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated.",
        )

    return user


def get_current_user_optional(
    request: Request,
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> Optional[User]:
    """
    Extracts user if valid token exists in header or cookie, otherwise returns None safely.
    """
    auth_token = token or request.cookies.get("trustmed_access_token")
    if not auth_token:
        return None

    payload = decode_access_token(auth_token)
    if not payload:
        return None

    user_id = payload.get("sub")
    if not user_id:
        return None

    user = None
    if str(user_id).isdigit():
        user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        user = db.query(User).filter(User.email == str(user_id)).first()
    if not user:
        user = db.query(User).filter(User.phone_number == str(user_id)).first()

    return user if (user and user.is_active) else None
