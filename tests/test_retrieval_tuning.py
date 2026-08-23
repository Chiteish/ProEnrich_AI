from app.retrieval.retriever import Retriever


def create_test_retriever():

    chunks = [
        {
            "text": (
                "Product ABC123 is an industrial circuit breaker. "
                "Rated voltage is 415 V AC."
            ),
            "product_id": "ABC123",
            "source": "ABC123.pdf",
            "page": 1
        },
        {
            "text": (
                "Product XYZ456 is an industrial circuit breaker. "
                "Rated voltage is 230 V AC."
            ),
            "product_id": "XYZ456",
            "source": "XYZ456.pdf",
            "page": 1
        },
        {
            "text": (
                "Product DEF789 is an industrial motor. "
                "Power rating is 5 kW."
            ),
            "product_id": "DEF789",
            "source": "DEF789.pdf",
            "page": 1
        }
    ]

    return Retriever(chunks)


def calculate_accuracy(
    retriever,
    test_cases,
    top_k,
    distance_threshold
):

    correct = 0

    for test in test_cases:

        results = retriever.retrieve(
            test["query"],
            top_k=top_k,
            distance_threshold=distance_threshold
        )

        retrieved_product_ids = [
            result.get("product_id")
            for result in results
        ]

        if test["expected_product_id"] in retrieved_product_ids:
            correct += 1

    return correct / len(test_cases)


def test_retrieval_tuning():

    retriever = create_test_retriever()

    test_cases = [
        {
            "query": "What is the voltage of ABC123?",
            "expected_product_id": "ABC123"
        },
        {
            "query": "Give information about XYZ456",
            "expected_product_id": "XYZ456"
        },
        {
            "query": "What is the power of DEF789?",
            "expected_product_id": "DEF789"
        }
    ]

    top_k_values = [1, 3, 5]

    threshold_values = [0.5, 1.0, 1.5, 2.0]

    best_accuracy = 0
    best_settings = None

    print("\n========== RETRIEVAL TUNING ==========")

    for top_k in top_k_values:

        for threshold in threshold_values:

            accuracy = calculate_accuracy(
                retriever,
                test_cases,
                top_k,
                threshold
            )

            print(
                f"Top-K={top_k}, "
                f"Threshold={threshold}, "
                f"Accuracy={accuracy:.2%}"
            )

            if accuracy > best_accuracy:

                best_accuracy = accuracy

                best_settings = {
                    "top_k": top_k,
                    "distance_threshold": threshold
                }

    print("\nBest Settings:")
    print(best_settings)

    print(
        f"Best Accuracy: {best_accuracy:.2%}"
    )

    print("======================================\n")

    assert best_accuracy > 0