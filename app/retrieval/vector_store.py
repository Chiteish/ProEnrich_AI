import faiss
import numpy as np


class VectorStore:

    def __init__(self, dimension):

        self.index = faiss.IndexFlatL2(dimension)

        self.metadata = []

    def add(self, embeddings, metadata):

        embeddings = np.array(
            embeddings,
            dtype=np.float32
        )

        self.index.add(embeddings)

        self.metadata.extend(metadata)

    def search(self, query_embedding, top_k=5):

        query_embedding = np.array(
            query_embedding,
            dtype=np.float32
        )

        distances, indices = self.index.search(
            query_embedding,
            top_k
        )

        results = []

        for distance, index in zip(
            distances[0],
            indices[0]
        ):

            if index != -1:

                result = self.metadata[index].copy()

                result["distance"] = float(distance)

                results.append(result)

        return results