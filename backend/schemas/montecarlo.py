from typing import Literal

from pydantic import BaseModel, Field

from backend.services.montecarlo import MAX_MC_PATHS


class McRequest(BaseModel):
    s0: float = Field(gt=0)
    k: float = Field(gt=0)
    sigma: float = Field(gt=0)  # annualised volatility
    r: float  # annualised, continuously compounded; also the drift under Q
    T: float = Field(gt=0)  # years
    paths: int = Field(ge=1, le=MAX_MC_PATHS)
    kind: Literal["call", "put"]
    seed: int | None = None
