import dataclasses

from fastapi import APIRouter, HTTPException

from backend.schemas.montecarlo import McRequest
from backend.services.continuous import GBM
from backend.services.montecarlo import price_mc

router = APIRouter(prefix="/api/mc")


@router.post("/price")
def price(req: McRequest):
    try:
        model = GBM(req.r, req.sigma)
        result = price_mc(model, req.s0, req.k, req.r, req.T,  req.paths, req.kind, req.seed)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    return dataclasses.asdict(result)
