import re
from pathlib import Path

from fastapi import FastAPI
from pydantic import BaseModel, Field

from app.ingestion.document_loader import (
    load_documents,
    chunk_documents
)
from app.ingestion.web_loader import WebLoader
from app.retrieval.retriever import Retriever
from app.enrichment.query_classifier import classify_query
from app.enrichment.enrichment_agent import EnrichmentAgent
from app.evidence.evidence_extractor import extract_evidence


app = FastAPI(
    title="Product Intelligence RAG Service"
)


DOCUMENT_FOLDER = str(Path(__file__).resolve().parents[1] / "data" / "documents")

documents = load_documents(DOCUMENT_FOLDER)

print(f"Documents/pages loaded: {len(documents)}")

chunks = chunk_documents(documents)

print(f"Chunks created: {len(chunks)}")

retriever = Retriever(chunks)
enrichment_agent = EnrichmentAgent()
web_loader = WebLoader()


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


def extract_metadata_from_evidence(retrieved_evidence):
    mfr_url = None
    ref_urls = []
    product_image = None
    alternate_images = []
    specification_sheet = None
    manual = None
    
    def clean_val(val):
        if val is None:
            return None
        val_str = str(val).strip()
        val_lower = val_str.lower()
        placeholders = [
            "none", "null", "n/a", "", 
            "-- no dib brand --", "-- no unilog brand --", "-- unbranded --", "-- no brand --",
            "no dib brand", "no unilog brand", "unbranded"
        ]
        if val_lower in placeholders:
            return None
        return val_str

    for item in retrieved_evidence:
        text = item.get("text", "")
        if not text:
            continue
        
        parts = text.split(" | ")
        for part in parts:
            if ":" not in part:
                continue
            key, val = part.split(":", 1)
            key = key.strip()
            val = clean_val(val)
            if not val:
                continue
                
            if key == "MFR URL" and not mfr_url:
                mfr_url = val
            elif key in ["Ref URL 1", "Ref URL 2", "Ref URL 3", "Ref URL 4", "Ref URL 5"]:
                if val not in ref_urls:
                    ref_urls.append(val)
            elif key == "Product Image" and not product_image:
                product_image = val
            elif key in ["Alternate Image 1", "Alternate Image 2", "Alternate Image 3", "Alternate Image 4"]:
                if val not in alternate_images:
                    alternate_images.append(val)
            elif key == "Specification Sheet" and not specification_sheet:
                specification_sheet = val
            elif key in ["Instruction/Installation Manual", "Owners/User Manual", "Service Manual"]:
                if not manual:
                    manual = val
                    
        # Fallback to source_url of the item
        src_url = item.get("source_url")
        if src_url and src_url.startswith(("http://", "https://")):
            if not mfr_url:
                mfr_url = src_url
            elif src_url != mfr_url and src_url not in ref_urls:
                ref_urls.append(src_url)
                
    return {
        "mfr_url": mfr_url,
        "ref_urls": ref_urls[:5],
        "product_image": product_image,
        "alternate_images": alternate_images[:4],
        "specification_sheet": specification_sheet,
        "manual": manual
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

    response = process_query(query)
    retrieved_evidence = list(response["evidence"])

    # Extract metadata from RAG evidence first
    evidence_metadata = extract_metadata_from_evidence(retrieved_evidence)

    # Gather candidate URLs from RAG evidence
    candidate_urls = []
    if evidence_metadata["mfr_url"] and evidence_metadata["mfr_url"].startswith(("http://", "https://")):
        candidate_urls.append(evidence_metadata["mfr_url"])
    for url in evidence_metadata["ref_urls"]:
        if url and url.startswith(("http://", "https://")) and url not in candidate_urls:
            candidate_urls.append(url)
    if evidence_metadata["specification_sheet"] and evidence_metadata["specification_sheet"].startswith(("http://", "https://")):
        if evidence_metadata["specification_sheet"] not in candidate_urls:
            candidate_urls.append(evidence_metadata["specification_sheet"])
    if evidence_metadata["manual"] and evidence_metadata["manual"].startswith(("http://", "https://")):
        if evidence_metadata["manual"] not in candidate_urls:
            candidate_urls.append(evidence_metadata["manual"])

    # Perform web discovery with candidate URLs
    web_data = web_loader.discover_and_load(
        mpn=product.mpn,
        manufacturer=product.manufacturer,
        description=product.description,
        candidate_urls=candidate_urls
    )

    # Process discovered web/PDF documents through RAG chunking pipeline
    discovered_docs = web_data.get("documents", [])
    if discovered_docs:
        discovered_chunks = chunk_documents(discovered_docs)
        web_evidence = extract_evidence(discovered_chunks)
        # Append web evidence if not already present
        seen_texts = {e.get("text") for e in retrieved_evidence}
        for item in web_evidence:
            if item.get("text") not in seen_texts:
                seen_texts.add(item.get("text"))
                retrieved_evidence.append(item)

    # Collect all available text from evidence for structured attribute extraction
    all_texts = [item.get("text", "") for item in retrieved_evidence if item.get("text")]

    # Extract structured attributes
    structured_attributes = enrichment_agent.extract_structured_attributes(all_texts)

    # Merge RAG evidence metadata with web discovered metadata using priority merging
    def merge_discovery_list(rag_list, web_list, max_len=5):
        combined = []
        seen = set()
        for item in (rag_list or []) + (web_list or []):
            if item and item not in seen:
                seen.add(item)
                combined.append(item)
        return combined[:max_len]

    mfr_url = evidence_metadata["mfr_url"] or web_data.get("mfr_url")
    ref_urls = merge_discovery_list(evidence_metadata["ref_urls"], web_data.get("ref_urls") or [], max_len=5)
    product_image = evidence_metadata["product_image"] or web_data.get("product_image")
    alternate_images = merge_discovery_list(evidence_metadata["alternate_images"], web_data.get("alternate_images") or [], max_len=4)
    specification_sheet = evidence_metadata["specification_sheet"] or web_data.get("specification_sheet")
    manual = evidence_metadata["manual"] or web_data.get("manual")

    # Determine overall status
    has_evidence = len(retrieved_evidence) > 0
    has_structured = any(val is not None for val in structured_attributes.values())
    has_web = any([
        mfr_url,
        ref_urls,
        product_image,
        alternate_images,
        specification_sheet,
        manual
    ])

    status = "FOUND" if (has_evidence or has_structured or has_web) else "NOT_FOUND"

    return {
        "product": product,
        "status": status,
        "retrieved_evidence": retrieved_evidence,
        "structured_attributes": structured_attributes,
        "web_discovery": {
            "mfr_url": mfr_url,
            "ref_urls": ref_urls,
            "product_image": product_image,
            "alternate_images": alternate_images,
            "specification_sheet": specification_sheet,
            "manual": manual
        }
    }