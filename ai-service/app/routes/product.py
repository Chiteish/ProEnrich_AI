from fastapi import APIRouter, HTTPException

from app.schemas.request import ProductRequest
from app.agents.product_understanding import ProductUnderstanding
from app.agents.attribute_extraction import AttributeExtractor
from app.agents.entity_resolution import EntityResolver
from app.services.taxonomy_service import TaxonomyService
from app.services.missing_attribute_service import (MissingAttributeService)
from app.services.query_builder import ProductQueryBuilder
from app.services.evidence_service import EvidenceService

router = APIRouter(
    prefix="/ai",
    tags=["AI"]
)

understanding_agent = ProductUnderstanding()
attribute_extractor = AttributeExtractor()

entity_resolver = EntityResolver(
    "data/manufacturers.csv",
    "data/brands.csv"
)

taxonomy_service = TaxonomyService(
    "data/taxonomy.csv"
)

missing_service = MissingAttributeService(
    "data/attribute_requirements.csv"
)

query_builder = ProductQueryBuilder()
evidence_service = EvidenceService()


@router.post("/process-product")
async def process_product(
    request: ProductRequest
):

    if not request.part_desc.strip():

        raise HTTPException(
            status_code=400,
            detail="Product description is required"
        )

    understanding = (
        understanding_agent
        .analyze(request.part_desc)
    )

    attributes = (
        attribute_extractor
        .extract(understanding)
    )

    manufacturer = (
        entity_resolver.resolve(
            request.part_manuf,
            "manufacturer"
        )
    )
    
    raw_brand = (
        request.e1_brand
        or request.unilog_brand
        or request.dib_brand
    )

    brand = (
        entity_resolver.resolve(
            raw_brand,
            "brand"
        )
    )

    classification = (
        taxonomy_service
        .find_match(
            understanding.get("product_type","") or ""
        )
    )

    if classification is None:

        classification = {
            "department": None,
            "class_name": None,
            "fine": None,
            "classpath": None,
            "confidence": 0,
            "method": "no_taxonomy"
        }

    missing = (
        missing_service
        .find_missing(
            attributes,
            classification.get("department"),
            classification.get("class_name"),
            classification.get("fine")
        )
    )

    return {
        "product_id": request.mfg_part_num,

        "identity": {
            "mpn": request.mfg_part_num,

            "manufacturer": manufacturer,

            "brand": brand
        },

        "understanding": understanding,

        "classification": classification,

        "attributes": attributes,

        "missing_attributes": missing,

        "evidence": [],

        "processing_status": "completed"
    }