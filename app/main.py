import re
from pathlib import Path

from fastapi import FastAPI
from pydantic import BaseModel, Field

from app.ingestion.document_loader import (
    load_documents,
    chunk_documents
)

from app.retrieval.retriever import Retriever
from app.enrichment.query_classifier import classify_query

from app.evidence.evidence_extractor import (
    extract_evidence
)


app = FastAPI(
    title="Product Intelligence RAG Service"
)


DOCUMENT_FOLDER = str(Path(__file__).resolve().parents[1] / "data" / "documents")

documents = load_documents(DOCUMENT_FOLDER)

print(f"Documents/pages loaded: {len(documents)}")

chunks = chunk_documents(documents)

print(f"Chunks created: {len(chunks)}")

retriever = Retriever(chunks)


class ProductRequest(BaseModel):

    mpn: str
    manufacturer: str
    description: str
    missing_attributes: list[str]


class QueryRequest(BaseModel):

    query: str = Field(min_length=3)
    top_k: int = Field(default=5, ge=1, le=20)
    distance_threshold: float = Field(default=1.5, gt=0)


def _query_entities(query):
    return {
        token.lower()
        for token in re.findall(r"[A-Za-z0-9][A-Za-z0-9_-]{3,}", query)
        if any(character.isdigit() for character in token) or "-" in token
    }


def process_query(query, top_k=5, distance_threshold=1.5):

    query_type = classify_query(query)
    results = retriever.retrieve(query, top_k, distance_threshold)
    entities = _query_entities(query)

    if entities:
        results = [
            result for result in results
            if any(entity in result["text"].lower() for entity in entities)
        ]

    evidence = extract_evidence(results)

    if not evidence:
        return {
            "status": "NOT_FOUND",
            "query_type": query_type,
            "answer": None,
            "evidence": []
        }

    if query_type == "comparison":
        grouped = {}
        for item in evidence:
            product_ids = re.findall(r"[A-Za-z0-9][A-Za-z0-9_-]{3,}", item["text"])
            product_id = next(
                (value for value in product_ids if any(char.isdigit() for char in value)),
                item["source"]
            )
            grouped.setdefault(product_id, []).append(item["text"])
        answer = " | ".join(
            f"{product_id}: {' '.join(texts)}"
            for product_id, texts in grouped.items()
        )
    else:
        answer = " ".join(item["text"] for item in evidence)

    return {
        "status": "FOUND",
        "query_type": query_type,
        "answer": answer,
        "evidence": evidence
    }


@app.get("/")
def home():

    return {
        "message": "RAG Service Running"
    }


@app.get("/health")
def health():

    return {"status": "ok", "documents": len(documents), "chunks": len(chunks)}


@app.post("/query")
def query_rag(request: QueryRequest):

    return process_query(
        request.query,
        request.top_k,
        request.distance_threshold
    )


@app.post("/enrich")
def enrich_product(
    product: ProductRequest
):

    query = f"""
    Product MPN: {product.mpn}
    Manufacturer: {product.manufacturer}

    Find the following product information:
    {", ".join(product.missing_attributes)}
    """

    response = process_query(query)

    return {
        "product": product,
        "status": response["status"],
        "retrieved_evidence": response["evidence"]
    }