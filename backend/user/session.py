"""The session cookie: how a logged-in browser is recognised. Import current_user to protect a route."""
import os

from fastapi import Depends, HTTPException, Request, Response
from sqlalchemy.orm import Session

from backend.db import get_db
from backend.user.models.user import User
from backend.user.services import auth

COOKIE = "session"


def _cookie_options() -> dict:
    # httpOnly: page JavaScript cannot read it. samesite=lax: not sent on cross-site POSTs.
    # secure: set COOKIE_SECURE=1 behind HTTPS; browsers drop secure cookies on plain-HTTP localhost.
    return {"httponly": True, "secure": os.getenv("COOKIE_SECURE") == "1", "samesite": "lax"}


def set_session(response: Response, user_id: int) -> None:
    response.set_cookie(
        COOKIE,
        auth.create_token(user_id),
        max_age=int(auth.TOKEN_LIFETIME.total_seconds()),
        **_cookie_options(),
    )


def clear_session(response: Response) -> None:
    # must repeat the options it was set with, or some browsers keep the cookie
    response.delete_cookie(COOKIE, **_cookie_options())


def current_user(request: Request, db: Session = Depends(get_db)) -> User:
    cookie = request.cookies.get(COOKIE)
    user_id = auth.read_token(cookie) if cookie else None
    user = db.get(User, user_id) if user_id is not None else None
    if user is None:
        raise HTTPException(status_code=401, detail="Not authenticated")  # one message for every failure
    return user
