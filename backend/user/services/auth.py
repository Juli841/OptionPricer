import os
import unicodedata
from datetime import datetime, timedelta, timezone

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from backend.user.models.user import User

JWT_ALGORITHM = "HS256"
TOKEN_LIFETIME = timedelta(hours=1)
_hasher = PasswordHasher()


def hash_password(password: str) -> str:
    return _hasher.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    try:
        _hasher.verify(password_hash, password)
        return True
    except VerifyMismatchError:
        return False


def create_token(user_id: int) -> str:
    expires = datetime.now(timezone.utc) + TOKEN_LIFETIME
    secret = os.environ["JWT_SECRET"]
    return jwt.encode({"sub": str(user_id), "exp": expires}, secret, algorithm=JWT_ALGORITHM)


def read_token(token: str) -> int | None:
    try:
        payload = jwt.decode(token, os.environ["JWT_SECRET"], algorithms=[JWT_ALGORITHM])
        return int(payload["sub"])
    except jwt.PyJWTError:
        return None


def normalize_email(email: str) -> str:
    return unicodedata.normalize("NFKC", email).strip().casefold()


def _commit_unique(db: Session) -> None:
    # the unique indexes are the referee, so two simultaneous requests can't both win
    try:
        db.commit()
    except IntegrityError as e:
        db.rollback()
        constraint = getattr(getattr(e.orig, "diag", None), "constraint_name", None) or ""
        raise ValueError("Username already taken" if "username" in constraint else "Email already registered")


def register(db: Session, email: str, username: str, password: str) -> User:
    user = User(email=normalize_email(email), username=username, password_hash=hash_password(password))
    db.add(user)
    _commit_unique(db)
    db.refresh(user)
    return user


def set_username(db: Session, user: User, username: str) -> User:
    user.username = username
    _commit_unique(db)
    db.refresh(user)
    return user


def authenticate(db: Session, email: str, password: str) -> User | None:
    user = db.query(User).filter(User.email == normalize_email(email)).first()
    if user is None or not verify_password(password, user.password_hash):
        return None
    return user
