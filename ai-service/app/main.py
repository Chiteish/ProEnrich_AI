from pathlib import Path
from fastapi import FastAPI

from app.api.routes import router
from app.services.document_loader import DocumentLoader
from app.services.rag_service import rag_service  # Import shared singleton instance

app = FastAPI(
    title="ProEnrich AI Service",
    version="0.1.0"
)

# Load documents and initialize shared RAG service index on startup
docs_dir = Path("data/documents")
if docs_dir.exists():
    document_loader = DocumentLoader(docs_dir)
    documents = document_loader.load_documents()

    if documents:
        rag_service.build_index(documents)

app.include_router(router)


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "proenrich-ai",
        "rag_ready": rag_service.ready
    }