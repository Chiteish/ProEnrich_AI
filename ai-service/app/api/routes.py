from fastapi import APIRouter

from app.schemas.product import ProductRequest
from app.schemas.response import ProductProcessResponse

from app.services.product_service import ProductService
from app.services.taxonomy_service import (
    find_missing_attributes
)

from app.agents.product_understanding import (
    ProductUnderstandingAgent
)

from app.agents.classification_agent import (
    ClassificationAgent
)

from app.agents.attribute_extraction import (
    AttributeExtractionAgent
)


router = APIRouter(
    prefix="/ai",
    tags=["AI Processing"]
)


product_service = ProductService()

understanding_agent = ProductUnderstandingAgent()

attribute_agent = AttributeExtractionAgent()

classification_agent = ClassificationAgent(
    taxonomy=[]
)


@router.post(
    "/process-product",
    response_model=ProductProcessResponse
)
async def process_product(
    product: ProductRequest
):

    understanding = understanding_agent.analyze(
        product.mfg_part_num,
        product.part_desc
    )

    manufacturer = (
        product_service.resolve_manufacturer(
            product.part_manuf
        )
    )

    brand_value = (
        product.e1_brand
        or product.unilog_brand
        or product.dib_brand
    )

    brand = product_service.resolve_brand(
        brand_value
    )

    classification = classification_agent.classify(
        product.part_desc
    )

    attributes = attribute_agent.extract(
        product.part_desc
    )

    missing = find_missing_attributes(
        understanding["product_type"],
        attributes
    )

    return {
        "product_id": product.mfg_part_num,

        "identity": {
            "mpn": product.mfg_part_num,
            "manufacturer": manufacturer,
            "brand": brand
        },

        "classification": classification,

        "attributes": attributes,

        "missing_attributes": missing,

        "processing_status": "completed"
    }