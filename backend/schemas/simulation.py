from typing import Literal

from pydantic import BaseModel, Field, model_validator

from backend.services.simulation import MAX_PATHS, MAX_STEPS  # one source of truth for the caps


class SimulationRequest(BaseModel):
    s0: float = Field(gt=0)
    u: float = Field(gt=0)
    d: float = Field(gt=0)
    # TODO: n: int, between 1 and MAX_STEPS            (Field(ge=..., le=...))
    n: int = Field(ge = 1, le = MAX_STEPS)
    # TODO: paths: int, between 1 and MAX_PATHS
    paths: int = Field(ge = 1, le = MAX_PATHS)
    measure: Literal["real_world", "risk_neutral"]
    # TODO: p: float | None = None, between 0 and 1 when given (real_world needs it, risk_neutral ignores it)
    p: float | None = Field(default = None, ge= 0, le = 1)
    r: float = 0  # only used by risk_neutral, to compute q
    seed: int | None = None
    # TODO: model_validator(mode="after"): if measure == "real_world" and p is None -> raise ValueError
    #       (from pydantic import model_validator; the error becomes a 422 automatically)
    @model_validator(mode="after")
    def need_p_for_real_world(self):
        if(self.measure == "real_world" and self.p is None):
            raise ValueError("p is required when measure is real_world")
        return self
