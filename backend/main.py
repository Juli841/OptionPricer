import dataclasses
from typing import Literal

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from backend.binomial import price_one_period

app = FastAPI()


@app.get("/api/health")
def health():
    return {"status": "ok"}


class OnePeriodRequest(BaseModel):
    s0: float = Field(gt=0)
    k: float = Field(gt=0)
    u: float = Field(gt=0)
    d: float = Field(gt=0)
    r: float
    kind: Literal["call", "put"]


@app.post("/api/price/one-period")
def one_period(req: OnePeriodRequest):
    try:
        result = price_one_period(req.s0, req.k, req.u, req.d, req.r, req.kind)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    return dataclasses.asdict(result)
