from pathlib import Path

from app.ingestion.document_loader import load_documents, chunk_documents
from app.retrieval.retriever import Retriever


def create_large_retriever():

    data_folder = Path(__file__).resolve().parents[1] / "data" / "documents"
    documents = load_documents(str(data_folder))
    documents = [
        document for document in documents
        if document["source"].startswith("Unihack_ Sample Dataset")
    ]
    chunks = chunk_documents(documents, chunk_size=1000, overlap=0)

    return Retriever(chunks)


def test_1000_product_accuracy():

    retriever = create_large_retriever()

    correct = 0
    total = 1000

    product_ids = [
        chunk["product_id"]
        for chunk in retriever.vector_store.metadata
        if chunk.get("product_id")
    ][:total]

    assert len(product_ids) == total

    for product_id in product_ids:

        query = f"Give me information about {product_id}"

        results = retriever.retrieve(
            query,
            top_k=5,
            distance_threshold=2.0
        )

        retrieved_product_ids = [
            result.get("product_id")
            for result in results
        ]

        if product_id in retrieved_product_ids:
            correct += 1

    accuracy = correct / total

    print("\n========== 1000 PRODUCT BENCHMARK ==========")
    print(f"Total products: {total}")
    print(f"Correct retrievals: {correct}")
    print(f"Accuracy@5: {accuracy:.2%}")
    print("=============================================\n")

    assert accuracy >= 0.80