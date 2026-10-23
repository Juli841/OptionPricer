from typing import Literal

from pydantic import BaseModel, Field


class OnePeriodRequest(BaseModel):
    s0: float = Field(gt=0)
    k: float = Field(gt=0)
    u: float = Field(gt=0)
    d: float = Field(gt=0)
    r: float
    kind: Literal["call", "put"]


class MultiPeriodRequest(OnePeriodRequest):
    n: int = Field(ge = 1, le = 1000)
