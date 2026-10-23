from fastapi import APIRouter, Depends, File, HTTPException, Response, UploadFile
from sqlalchemy.orm import Session

from backend.db import get_db
from backend.user.models.user import User
from backend.user.schemas.auth import UserOut
from backend.user.services import avatar
from backend.user.session import current_user

router = APIRouter(prefix="/api/auth")


@router.post("/avatar", response_model=UserOut)
async def upload_avatar(
    file: UploadFile = File(...),
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    # read one byte past the limit: enough to detect "too big" without loading a huge upload into memory
    data = await file.read(avatar.MAX_AVATAR_BYTES + 1)
    try:
        return avatar.set_avatar(db, user, data)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))


@router.get("/avatar")
def get_avatar(user: User = Depends(current_user)):
    if user.avatar is None:
        raise HTTPException(status_code=404, detail="No avatar")
    return Response(
        content=user.avatar,
        media_type=user.avatar_type,
        # the frontend adds ?v=<upload time>, so a new upload is a new URL and this can be cached
        headers={"Cache-Control": "private, max-age=86400", "X-Content-Type-Options": "nosniff"},
    )


@router.delete("/avatar", response_model=UserOut)
def delete_avatar(user: User = Depends(current_user), db: Session = Depends(get_db)):
    return avatar.clear_avatar(db, user)
