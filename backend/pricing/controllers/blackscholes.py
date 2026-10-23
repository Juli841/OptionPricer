import dataclasses

from fastapi import APIRouter, HTTPException

from backend.pricing.schemas.blackscholes import BsRequest
from backend.pricing.services.blackscholes import price_bs

router = APIRouter(prefix="/api/bs")


@router.post("/price")
def price(req: BsRequest):
    try:
        result = price_bs(req.s0, req.k, req.sigma, req.r, req.T, req.kind)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    return dataclasses.asdict(result)
