import faiss
import numpy as np
import json
from pathlib import Path


class VectorStore:

    def __init__(self):

        self.index = None
        self.documents = []

    def build(
        self,
        embeddings,
        documents
    ):

        embeddings = np.asarray(
            embeddings,
            dtype="float32"
        )

        dimension = embeddings.shape[1]

        self.index = faiss.IndexFlatIP(
            dimension
        )

        self.index.add(
            embeddings
        )

        self.documents = documents

    def search(
        self,
        query_embedding,
        top_k=5
    ):

        if self.index is None:
            return []

        query_embedding = np.asarray(
            [query_embedding],
            dtype="float32"
        )

        scores, indices = self.index.search(
            query_embedding,
            top_k
        )

        results = []

        for score, index in zip(
            scores[0],
            indices[0]
        ):

            if index < 0:
                continue

            document = self.documents[index]

            results.append({
                "document_id":
                    document["id"],

                "text":
                    document["text"],

                "source":
                    document["source"],

                "score":
                    float(score)
            })

        return results