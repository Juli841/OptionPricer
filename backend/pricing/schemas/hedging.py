from typing import Literal

from pydantic import BaseModel, Field

from backend.pricing.services.multi_period import FULL_TREE_MAX_N


class HedgeRequest(BaseModel):
    s0: float = Field(gt=0)
    k: float = Field(gt=0)
    u: float = Field(gt=0)
    d: float = Field(gt=0)
    r: float
    kind: Literal["call", "put"]
    moves: list[bool] = Field(min_length = 1, max_length = FULL_TREE_MAX_N)
