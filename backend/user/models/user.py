from datetime import datetime

from sqlalchemy import Index, func
from sqlalchemy.orm import Mapped, mapped_column

from backend.db import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(unique=True, index=True)
    password_hash: Mapped[str]
    username: Mapped[str | None]  # nullable: accounts made before usernames have none
    avatar_type: Mapped[str | None]
    avatar: Mapped[bytes | None]
    @property
    def has_avatar(self) -> bool:
        return self.avatar is not None
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())


# case-insensitive guard in the database, in case some code path forgets normalize_email
Index("ix_users_email_lower", func.lower(User.email), unique=True)
# same for usernames: "Sam" and "sam" are one name
Index("ix_users_username_lower", func.lower(User.username), unique=True)
