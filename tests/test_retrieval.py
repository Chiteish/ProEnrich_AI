from app.retrieval.retriever import Retriever


def test_retrieval():

    # Sample chunks for testing
    chunks = [
        {
            "text": "The rated voltage of product ABC123 is 415 V AC.",
            "source": "test_datasheet.pdf",
            "page": 1
        },
        {
            "text": "The current rating of product ABC123 is 63 A.",
            "source": "test_datasheet.pdf",
            "page": 2
        },
        {
            "text": "The product enclosure has an IP65 protection rating.",
            "source": "test_datasheet.pdf",
            "page": 3
        }
    ]

    retriever = Retriever(chunks)

    results = retriever.retrieve(
        "What is the voltage of ABC123?",
        top_k=3,
        distance_threshold=2.0
    )

    print("\nRetrieval Results:")

    for result in results:
        print(result)

    assert len(results) > 0