from app.retrieval.retriever import Retriever


def create_retriever():

    chunks = [
        {
            "text": (
                "Product ABC123 is an industrial circuit breaker. "
                "Rated voltage: 415 V AC. "
                "Current rating: 63 A."
            ),
            "product_id": "ABC123",
            "source": "ABC123_datasheet.pdf",
            "page": 1
        },
        {
            "text": (
                "Product XYZ456 is an industrial circuit breaker. "
                "Rated voltage: 230 V AC. "
                "Current rating: 32 A."
            ),
            "product_id": "XYZ456",
            "source": "XYZ456_datasheet.pdf",
            "page": 1
        }
    ]

    return Retriever(chunks)


def test_attribute_query():

    retriever = create_retriever()

    results = retriever.retrieve(
        "What is the voltage of ABC123?",
        top_k=2,
        distance_threshold=2.0
    )

    assert len(results) > 0


def test_product_query():

    retriever = create_retriever()

    results = retriever.retrieve(
        "Give me information about product ABC123",
        top_k=2,
        distance_threshold=2.0
    )

    assert len(results) > 0


def test_comparison_query():

    retriever = create_retriever()

    results = retriever.retrieve(
        "Compare ABC123 and XYZ456 on voltage and current rating",
        top_k=2,
        distance_threshold=2.0
    )

    retrieved_product_ids = {result["product_id"] for result in results}

    assert {"ABC123", "XYZ456"}.issubset(retrieved_product_ids)