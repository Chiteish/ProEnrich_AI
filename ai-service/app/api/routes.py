from fastapi import APIRouter

from app.schemas.product import ProductRequest
from app.schemas.response import ProductProcessResponse
from app.services.product_service import ProductService
from app.services.taxonomy_service import TaxonomyService
from app.agents.product_understanding import ProductUnderstandingAgent
from app.agents.classification_agent import ClassificationAgent
from app.agents.attribute_extraction import AttributeExtractionAgent
from app.services.rag_service import rag_service  # Import shared singleton instance
from app.services.query_builder import ProductQueryBuilder
from app.config import DATA_DIR


# Module-level instances (initialized once)
query_builder = ProductQueryBuilder()
product_service = ProductService()
understanding_agent = ProductUnderstandingAgent()
attribute_agent = AttributeExtractionAgent()

taxonomy_service = TaxonomyService(DATA_DIR / "taxonomy.csv")
classification_agent = ClassificationAgent(taxonomy_service.get_taxonomy())

router = APIRouter(
    prefix="/ai",
    tags=["AI"]
)


@router.get("/test-rag")
async def test_rag():
    """Debug endpoint to verify FAISS retrieval independently."""
    results = rag_service.retrieve("Diablo sanding belt 1/2 x 18", top_k=5)
    return {"rag_ready": rag_service.ready, "results": results}


@router.post(
    "/process-product",
    response_model=ProductProcessResponse
)
async def process_product(
    product: ProductRequest
):
    # -----------------------------
    # 1. Identity
    # -----------------------------
    manufacturer = product_service.resolve_manufacturer(
        product.part_manuf
    )

    raw_brand = (
        product.e1_brand
        or product.unilog_brand
        or product.dib_brand
    )

    brand = product_service.resolve_brand(raw_brand)

    # -----------------------------
    # 2. Product understanding
    # -----------------------------
    understanding = understanding_agent.analyze(
        product.mfg_part_num,
        product.part_desc
    )

    # -----------------------------
    # 3. Attribute extraction
    # -----------------------------
    attributes = attribute_agent.extract(product.part_desc)

    # Sync extracted dimensions back into understanding
    extracted_dims = [
        attr["value"] for attr in attributes if attr.get("label") == "Dimension"
    ]
    if extracted_dims:
        understanding["dimensions"] = list(dict.fromkeys(extracted_dims))

    # -----------------------------
    # 4. Classification
    # -----------------------------
    classification = classification_agent.classify(
        product.part_desc,
        understanding.get("product_type")
    )

    # -----------------------------
    # 5. RAG Retrieval
    # -----------------------------
    query = query_builder.build(
        product,
        understanding,
        classification,
        attributes
    )

    evidence = rag_service.retrieve(
        query,
        top_k=5
    )

    # -----------------------------
    # 6. Response
    # -----------------------------
    return {
        "product_id": product.mfg_part_num,
        "identity": {
            "mpn": product.mfg_part_num,
            "manufacturer": manufacturer,
            "brand": brand
        },
        "understanding": understanding,
        "classification": classification,
        "attributes": attributes,
        "missing_attributes": [],
        "evidence": evidence,
        "processing_status": "completed"
    }