from typing import Literal

from pydantic import BaseModel, Field

from backend.services.multi_period import FULL_TREE_MAX_N


class HedgeRequest(BaseModel):
    s0: float = Field(gt=0)
    k: float = Field(gt=0)
    u: float = Field(gt=0)
    d: float = Field(gt=0)
    r: float
    kind: Literal["call", "put"]
    # TODO: moves: list[bool] with 1..FULL_TREE_MAX_N entries (True = up). Hint: Field(min_length=..., max_length=...)
    moves: list[bool] = Field(min_length = 1, max_length = FULL_TREE_MAX_N)
