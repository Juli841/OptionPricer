import dataclasses

from fastapi import APIRouter, HTTPException

from backend.schemas.simulation import SimulationRequest
from backend.services.simulation import simulate_paths

router = APIRouter(prefix="/api")


@router.post("/simulate")
def simulate(req: SimulationRequest):
    # TODO: pick the probability: p = req.p for "real_world"; for "risk_neutral" q = (1 + r - d) / (u - d)
    #       (q is only a probability if d < 1 + r < u: reject anything else with HTTPException 422)
    # TODO: call simulate_paths(req.s0, req.u, req.d, req.n, p, req.paths, req.seed)
    # TODO: ValueError from the engine -> HTTPException(status_code=422, detail=str(e))
    # TODO: return dataclasses.asdict(result)
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

