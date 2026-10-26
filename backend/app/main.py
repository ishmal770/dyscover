from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routes.learning import router as learning_router
from app.routes.placement import router as placement_router

app = FastAPI(title="Dyscover API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.CORS_ORIGINS.split(",") if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(learning_router)
app.include_router(placement_router)


@app.get("/health")
def health() -> dict:
    return {"ok": True, "service": "dyscover-api"}
