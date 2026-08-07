from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict
from app.core.constants import UserRole


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None
    role: UserRole = UserRole.CUSTOMER
    phone_number: Optional[str] = None
    whatsapp_optin: bool = False
    dnd_registered: bool = False


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: EmailStr
    full_name: Optional[str]
    role: UserRole
    is_active: bool
    phone_number: Optional[str]
    whatsapp_optin: bool
    dnd_registered: bool


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    sub: str
    role: Optional[str] = None
