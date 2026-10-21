
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.datasets import router as datasets_router
from app.api.routes.health import router as health_router

app = FastAPI(
    title="Orbit Data Lab API",
    version="0.1.0",
    description="Local dataset exploration and analysis service.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["Content-Type"],
)

app.include_router(health_router, prefix="/api/v1")
app.include_router(datasets_router, prefix="/api/v1")
