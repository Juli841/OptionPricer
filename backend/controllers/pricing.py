import dataclasses

from fastapi import APIRouter, HTTPException

from backend.schemas.pricing import MultiPeriodRequest, OnePeriodRequest
from backend.services.binomial import price_one_period
from backend.services.multi_period import price_multi_period
from backend.services.american import price_american

router = APIRouter(prefix="/api/price")


@router.post("/one-period")
def one_period(req: OnePeriodRequest):
    try:
        result = price_one_period(req.s0, req.k, req.u, req.d, req.r, req.kind)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    return dataclasses.asdict(result)


@router.post("/multi-period")
def multi_period(req: MultiPeriodRequest):
    try:
        result = price_multi_period(req.s0, req.k, req.u, req.d, req.r, req.n, req.kind)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    return dataclasses.asdict(result)


@router.post("/american")
def american(req: MultiPeriodRequest):
    try:
        result = price_american(req.s0, req.k, req.u, req.d, req.r, req.n, req.kind)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    return dataclasses.asdict(result)
