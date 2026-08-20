from typing import Optional
from pydantic import BaseModel, Field, field_validator, ConfigDict


class UserSignupRequest(BaseModel):
    email: str = Field(..., description="User or patient email address")
    password: str = Field(..., min_length=8, description="Raw password (minimum 8 characters)")
    phone_number: str = Field(..., description="User phone number (e.g. +1-555-019-2834)")
    first_name: str = Field(..., description="First name")
    last_name: str = Field(..., description="Last name")
    age: Optional[int] = Field(default=None, ge=1, le=120, description="Age")
    gender: Optional[str] = Field(default=None, description="Gender")
    address: Optional[str] = Field(default=None, description="Address")
    role: Optional[str] = Field(default="Patient", description="User role (Patient, Clinician, etc.)")
    npi_number: Optional[str] = Field(default=None, description="National Provider Identifier (NPI)")
    wallet_address: Optional[str] = Field(default=None, description="EVM wallet address for on-chain signing")

    @field_validator("email")
    @classmethod
    def validate_email_format(cls, v: str) -> str:
        v = v.strip().lower()
        if "@" not in v or "." not in v:
            raise ValueError("Invalid email format.")
        return v


class UserLoginRequest(BaseModel):
    phone_number: str = Field(..., description="Registered phone number or email")
    password: str = Field(..., description="Account password")


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    phone_number: Optional[str] = None
    patient_id: Optional[str] = None
    record_number: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    full_name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    role: str
    npi_number: Optional[str] = None
    wallet_address: Optional[str] = None
    is_active: bool


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
