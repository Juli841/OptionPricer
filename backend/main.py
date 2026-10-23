from fastapi import FastAPI

from backend.pricing.controllers import blackscholes, continuous, health, hedging, montecarlo, pricing, simulation
from backend.db import Base, engine
from backend.user.controllers import auth as user_auth, avatar as user_avatar
from backend.user.models import user  # noqa: F401  (registers the table)

Base.metadata.create_all(engine)  # ponytail: no migrations; Alembic when the schema starts changing

app = FastAPI()
app.include_router(health.router)
app.include_router(pricing.router)
app.include_router(simulation.router)
app.include_router(hedging.router)
app.include_router(continuous.router)
app.include_router(montecarlo.router)
app.include_router(blackscholes.router)
app.include_router(user_auth.router)
app.include_router(user_avatar.router)
