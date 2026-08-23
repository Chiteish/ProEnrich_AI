import re

from app.retrieval.embeddings import EmbeddingModel
from app.retrieval.vector_store import VectorStore


class Retriever:

    def __init__(self, chunks):

        print(f"Retriever received {len(chunks)} chunks")

        if not chunks:
            raise ValueError(
                "No chunks found. Check data/documents and PDF extraction."
            )

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

        dimension = embeddings.shape[-1]

        self.vector_store = VectorStore(dimension)

        self.vector_store.add(
            embeddings,
            valid_chunks
        )
        self.chunks = valid_chunks

    def retrieve(
        self,
        query,
        top_k=5,
        distance_threshold=1.5
    ):

        query_embedding = self.embedding_model.encode_query(query)

        results = self.vector_store.search(
            query_embedding,
            top_k
        )

        query_tokens = {
            token.lower()
            for token in re.findall(r"[A-Za-z0-9][A-Za-z0-9_-]{3,}", query)
        }
        exact_matches = []
        for chunk in self.chunks:
            product_id = str(chunk.get("product_id") or "").lower()
            if product_id and product_id in query_tokens:
                match = chunk.copy()
                match["distance"] = 0.0
                match["rank"] = 1
                exact_matches.append(match)

        if exact_matches:
            results = exact_matches + [
                result for result in results
                if result.get("product_id") not in {
                    match.get("product_id") for match in exact_matches
                }
            ]

        filtered_results = []

        for result in results:

            if result["distance"] <= distance_threshold:
                filtered_results.append(result)

        return filtered_results