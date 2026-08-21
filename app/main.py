from fastapi import FastAPI
from pydantic import BaseModel

from app.ingestion.document_loader import (
    load_documents,
    chunk_documents
)

from app.retrieval.retriever import Retriever

from app.evidence.evidence_extractor import (
    extract_evidence
)


app = FastAPI(
    title="Product Intelligence RAG Service"
)


DOCUMENT_FOLDER = "data/documents"

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


@app.get("/")
def home():

    return {
        "message": "RAG Service Running"
    }


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

    retrieved_results = retriever.retrieve(
        query,
        top_k=5
    )

    evidence = extract_evidence(
        retrieved_results
    )

    return {
        "product": product,
        "retrieved_evidence": evidence
    }