from sqlalchemy.orm import Session

from backend.user.models.user import User

MAX_AVATAR_BYTES = 2 * 1024 * 1024  # keep in sync with frontend/src/pages/AccountPage.tsx
AVATAR_TYPES = {"image/png", "image/jpeg", "image/webp"}


def sniff_type(data: bytes) -> str | None:
    # the type the client declares can lie, so look at the first bytes of the file
    if data.startswith(bytes.fromhex("89504e470d0a1a0a")):
        return "image/png"
    if data.startswith(bytes.fromhex("ffd8ff")):
        return "image/jpeg"
    if data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return "image/webp"
    return None


def set_avatar(db: Session, user: User, data: bytes) -> User:
    if not data:
        raise ValueError("The image is empty")
    if len(data) > MAX_AVATAR_BYTES:
        raise ValueError("The image must be under 2 MB")
    content_type = sniff_type(data)
    if content_type not in AVATAR_TYPES:
        raise ValueError("Choose a PNG, JPEG or WebP image")
    user.avatar = data
    user.avatar_type = content_type
    db.commit()
    return user


def clear_avatar(db: Session, user: User) -> User:
    user.avatar = None
    user.avatar_type = None
    db.commit()
    return user
