from pathlib import Path
from app.rag.embeddings import EmbeddingService
from app.rag.vector_store import VectorStore


class RAGService:

    def __init__(self):
        self.embedding_service = EmbeddingService()
        self.vector_store = VectorStore()
        self.ready = False

        # Auto-load existing index if already built on disk
        self._try_load_existing_index()

    def _try_load_existing_index(self):
        """Attempts to load pre-built index and documents if available on disk."""
        index_file = Path("data/index.faiss")
        docs_file = Path("data/documents.pkl")

        if index_file.exists() and docs_file.exists():
            try:
                self.vector_store.load(index_path=str(index_file), docs_path=str(docs_file))
                self.ready = True
            except Exception:
                self.ready = False

    def build_index(self, documents: list[dict]):
        if not documents:
            return

        texts = [doc["text"] for doc in documents]
        embeddings = self.embedding_service.encode(texts)

        self.vector_store.build(embeddings, documents)
        self.ready = True

    def retrieve(self, query: str, top_k: int = 5):
        if not self.ready or not query:
            return []

        query_embedding = self.embedding_service.encode([query])[0]
        return self.vector_store.search(query_embedding, top_k)


# Shared singleton instance
rag_service = RAGService()