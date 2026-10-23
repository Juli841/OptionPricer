import re

from pydantic import BaseModel, EmailStr, Field, field_validator

# keep in sync with frontend/src/utils/username.ts
USERNAME_PATTERN = r"^[A-Za-z0-9_]{3,20}$"


class Credentials(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class RegisterRequest(Credentials):
    username: str = Field(pattern=USERNAME_PATTERN)

    # login keeps plain Credentials: it must accept any password an account already has.
    # keep in sync with frontend/src/utils/password.ts
    @field_validator("password")
    @classmethod
    def strong_enough(cls, p: str) -> str:
        missing = [
            name
            for name, pattern in [
                ("a lowercase letter", r"[a-z]"),
                ("an uppercase letter", r"[A-Z]"),
                ("a number", r"\d"),
                ("a symbol", r"[^A-Za-z0-9]"),
            ]
            if not re.search(pattern, p)
        ]
        if missing:
            raise ValueError("password needs " + ", ".join(missing))
        return p


class UsernameUpdate(BaseModel):
    username: str = Field(pattern=USERNAME_PATTERN)


class UserOut(BaseModel):
    id: int
    email: str
    has_avatar: bool
    username: str | None
    model_config = {"from_attributes": True}
