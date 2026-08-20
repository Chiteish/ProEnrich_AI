import sys
from pathlib import Path

sys.path.append(
    str(
        Path(__file__).resolve().parents[1]
    )
)

from app.services.document_loader import (
    DocumentLoader
)

from app.rag.embeddings import (
    EmbeddingService
)

from app.rag.vector_store import (
    VectorStore
)


BASE_DIR = Path(__file__).resolve().parents[1]

DOCUMENT_DIR = (
    BASE_DIR /
    "data" /
    "documents"
)


loader = DocumentLoader(
    DOCUMENT_DIR
)

documents = loader.load_documents()

if not documents:

    print(
        "No documents found."
    )

    sys.exit(0)


embedding_service = (
    EmbeddingService()
)

texts = [
    document["text"]
    for document in documents
]

embeddings = (
    embedding_service.encode(
        texts
    )
)

store = VectorStore()

store.build(
    embeddings,
    documents
)

print(
    f"Indexed {len(documents)} documents"
)