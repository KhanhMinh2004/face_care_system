from pydantic import BaseModel, EmailStr


class RegisterRequest(BaseModel):

    email: EmailStr
    password: str
    confirm_password: str


class LoginRequest(BaseModel):

    email: EmailStr
    password: str


class ForgotPasswordRequest(BaseModel):

    email: EmailStr


class ResetPasswordRequest(BaseModel):

    email: EmailStr
    new_password: str
    

class RefreshRequest(BaseModel):
    refresh_token: str