from fastapi import FastAPI

from backend.controllers import health, pricing, simulation

app = FastAPI()
app.include_router(health.router)
app.include_router(pricing.router)
app.include_router(simulation.router)
