import dataclasses

from fastapi import APIRouter, HTTPException

from backend.schemas.hedging import HedgeRequest
from backend.services.hedging import replicate

router = APIRouter(prefix="/api")


@router.post("/hedge")
def hedge(req: HedgeRequest):
    try:
        result = replicate(req.s0, req.k, req.u, req.d, req.r, req.kind, req.moves)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    return dataclasses.asdict(result)
    raise NotImplementedError
