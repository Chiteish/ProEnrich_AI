from sentence_transformers import SentenceTransformer


class EmbeddingModel:

    def __init__(self):
        self.model = SentenceTransformer(
            "all-MiniLM-L6-v2"
        )

    def encode_documents(self, texts):
        return self.model.encode(
            texts,
            convert_to_numpy=True
        )

    def encode_query(self, query):
        return self.model.encode(
            [query],
            convert_to_numpy=True
        )