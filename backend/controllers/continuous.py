import dataclasses

from fastapi import APIRouter, HTTPException

from backend.schemas.continuous import CrrRequest, GbmRequest
from backend.services.continuous import crr_params, price_crr, simulate_gbm

router = APIRouter(prefix="/api/gbm")


@router.post("/simulate")
def simulate(req: GbmRequest):
    try:
        result = simulate_gbm(req.s0, req.mu, req.sigma, req.T, req.n, req.paths, req.seed)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    return dataclasses.asdict(result)


@router.post("/crr")
def crr(req: CrrRequest):
    try:
        params = crr_params(req.sigma, req.r, req.T, req.n)
        result = price_crr(req.s0, req.k, req.sigma, req.r, req.T, req.n, req.kind)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    return {**dataclasses.asdict(result), "params": dataclasses.asdict(params)}
