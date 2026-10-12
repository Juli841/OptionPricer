from typing import Literal

from pydantic import BaseModel, Field, model_validator

from backend.services.simulation import MAX_PATHS, MAX_STEPS  # one source of truth for the caps


class SimulationRequest(BaseModel):
    s0: float = Field(gt=0)
    u: float = Field(gt=0)
    d: float = Field(gt=0)
    n: int = Field(ge = 1, le = MAX_STEPS)
    paths: int = Field(ge = 1, le = MAX_PATHS)
    measure: Literal["real_world", "risk_neutral"]
    p: float | None = Field(default = None, ge= 0, le = 1)
    r: float = 0  # only used by risk_neutral, to compute q
    seed: int | None = None
    @model_validator(mode="after")
    def need_p_for_real_world(self):
        if(self.measure == "real_world" and self.p is None):
            raise ValueError("p is required when measure is real_world")
        return self
