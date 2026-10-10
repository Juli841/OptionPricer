from fastapi import FastAPI

from backend.controllers import continuous, health, hedging, montecarlo, pricing, simulation

app = FastAPI()
app.include_router(health.router)
app.include_router(pricing.router)
app.include_router(simulation.router)
app.include_router(hedging.router)
app.include_router(continuous.router)
app.include_router(montecarlo.router)
