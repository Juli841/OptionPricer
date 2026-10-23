import dataclasses

from fastapi import APIRouter, HTTPException

from backend.pricing.schemas.simulation import SimulationRequest
from backend.pricing.services.simulation import simulate_paths

router = APIRouter(prefix="/api")


@router.post("/simulate")
def simulate(req: SimulationRequest):
    if(req.measure == "real_world"):
        p = req.p
    elif(req.measure == "risk_neutral"):
        if(not (req.d < (1 + req.r) and 1 + (req.r) < req.u)):
            raise HTTPException(status_code=422, detail="Arbitrage detected")
        else:
            p = (1 + req.r - req.d) / (req.u - req.d)
    try:
        result = simulate_paths(req.s0, req.u, req.d, req.n, p, req.paths, req.seed)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    return dataclasses.asdict(result)

