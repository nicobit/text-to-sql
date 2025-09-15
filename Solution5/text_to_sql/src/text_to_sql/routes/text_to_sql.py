from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from uuid import UUID, uuid4

from app.services import user_service  # hypothetical business layer

router = APIRouter(prefix="/users", tags=["users"])

# ────── Pydantic schemas ────────────────────────────────────────────────────
class UserIn(BaseModel):
    username: str = Field(..., max_length=30)
    email: str


class UserOut(UserIn):
    id: UUID


# ────── Routes ─────────────────────────────────────────────────────────────
@router.post("", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_user(payload: UserIn) -> UserOut:
    """Create a new user."""
    try:
        new_user = user_service.create(username=payload.username,
                                       email=payload.email)
    except user_service.DuplicateName:
        raise HTTPException(status_code=409, detail="username already exists")

    return UserOut(id=new_user.id, **payload.dict())


@router.get("", response_model=List[UserOut])
def list_users(limit: int = 100) -> List[UserOut]:
    """List users (paginated with ?limit=)."""
    rows = user_service.list(limit=limit)
    return [UserOut.from_orm(r) for r in rows]


@router.get("/{user_id}", response_model=UserOut)
def get_user(user_id: UUID) -> UserOut:
    user = user_service.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="user not found")
    return UserOut.from_orm(user)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: UUID) -> None:
    deleted = user_service.delete(user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="user not found")
