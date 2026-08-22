from app.rag.embeddings import (
    EmbeddingService
)

from app.rag.vector_store import (
    VectorStore
)


def test_vector_search():

    documents = [
        {
            "id": "doc1",
            "text":
                "Diablo sanding belt 1/2 x 18",
            "source":
                "test",
        },

        {
            "id": "doc2",
            "text":
                "Industrial valve specifications",
            "source":
                "test",
        }
    ]

    embedding_service = (
        EmbeddingService()
    )

    embeddings = (
        embedding_service.encode(
            [
                doc["text"]
                for doc in documents
            ]
        )
    )

    store = VectorStore()

    store.build(
        embeddings,
        documents
    )

    query_embedding = (
        embedding_service.encode(
            ["Diablo sanding belt"]
        )[0]
    )

    results = store.search(
        query_embedding,
        top_k=1
    )

    assert len(results) == 1

    assert results[0]["document_id"] \
        == "doc1"