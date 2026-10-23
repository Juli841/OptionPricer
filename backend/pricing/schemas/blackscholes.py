from typing import Literal

from pydantic import BaseModel, Field


class BsRequest(BaseModel):
    s0: float = Field(gt=0)
    k: float = Field(gt=0)
    sigma: float = Field(gt=0)  # annualised volatility
    r: float  # annualised, continuously compounded
    T: float = Field(gt=0)  # years
    kind: Literal["call", "put"]
