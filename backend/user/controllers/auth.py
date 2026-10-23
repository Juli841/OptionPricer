from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from backend.db import get_db
from backend.user.models.user import User
from backend.user.schemas.auth import Credentials, RegisterRequest, UserOut, UsernameUpdate
from backend.user.services import auth
from backend.user.session import clear_session, current_user, set_session

router = APIRouter(prefix="/api/auth")


@router.post("/register", status_code=201, response_model=UserOut)
def register(creds: RegisterRequest, resp: Response, db: Session = Depends(get_db)):
    try:
        user = auth.register(db, creds.email, creds.username, creds.password)
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))
    set_session(resp, user.id)
    return user


@router.post("/login", response_model=UserOut)
def login(creds: Credentials, resp: Response, db: Session = Depends(get_db)):
    user = auth.authenticate(db, creds.email, creds.password)
    if user is None:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    set_session(resp, user.id)
    return user


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(current_user)):
    return user


@router.post("/logout", status_code=204)
def logout(resp: Response):
    clear_session(resp)


@router.patch("/username", response_model=UserOut)
def rename(body: UsernameUpdate, user: User = Depends(current_user), db: Session = Depends(get_db)):
    try:
        return auth.set_username(db, user, body.username)
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))
