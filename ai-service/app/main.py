from fastapi import FastAPI

from app.routes.product import router


app = FastAPI(
    title="ProEnrich AI Service",
    version="2.0.0"
)


app.include_router(router)


@app.get("/health")
async def health():

    return {
        "status": "ok",
        "service": "proenrich-ai"
    }