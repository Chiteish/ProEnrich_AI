from app.retrieval.embeddings import EmbeddingModel
from app.retrieval.vector_store import VectorStore


class Retriever:

    def __init__(self, chunks):

        print(f"Retriever received {len(chunks)} chunks")

        # Stop early if no chunks were created
        if not chunks:
            raise ValueError(
                "No chunks found. Check data/documents and PDF extraction."
            )

        # Keep only chunks containing actual text
        valid_chunks = [
            chunk
            for chunk in chunks
            if chunk.get("text") and chunk["text"].strip()
        ]

        print(f"Valid text chunks: {len(valid_chunks)}")

        if not valid_chunks:
            raise ValueError(
                "Chunks exist, but they contain no text. "
                "Your PDF may be image/scanned or text extraction failed."
            )

        self.embedding_model = EmbeddingModel()

        texts = [
            chunk["text"]
            for chunk in valid_chunks
        ]

        embeddings = self.embedding_model.encode_documents(texts)

        print(f"Embedding shape: {embeddings.shape}")

        # Use last dimension safely
        dimension = embeddings.shape[-1]

        self.vector_store = VectorStore(dimension)

        self.vector_store.add(
            embeddings,
            valid_chunks
        )

    def retrieve(self, query, top_k=5):

        query_embedding = self.embedding_model.encode_query(query)

        return self.vector_store.search(
            query_embedding,
            top_k
        )