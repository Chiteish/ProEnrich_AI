from app.retrieval.retriever import Retriever


def test_missing_information():

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
        }
    ]

    retriever = Retriever(chunks)

    results = retriever.retrieve(
        "What is the operating temperature of ABC123?",
        top_k=3,
        distance_threshold=0.5
    )

    # If no strong evidence exists,
    # hallucination protection should return no results
    assert len(results) == 0