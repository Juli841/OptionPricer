from typing import Literal

from pydantic import BaseModel, Field

from backend.services.continuous import MAX_PATHS, MAX_STEPS


class GbmRequest(BaseModel):
    s0: float = Field(gt=0)
    mu: float  # annualised drift
    sigma: float = Field(gt=0)  # annualised volatility
    T: float = Field(gt=0)  # years
    n: int = Field(ge=1, le=MAX_STEPS)
    paths: int = Field(ge=1, le=MAX_PATHS)
    seed: int | None = None


class CrrRequest(BaseModel):
    s0: float = Field(gt=0)
    k: float = Field(gt=0)
    sigma: float = Field(gt=0)
    r: float  # annualised, continuously compounded
    T: float = Field(gt=0)
    n: int = Field(ge=1, le=MAX_STEPS)
    kind: Literal["call", "put"]
