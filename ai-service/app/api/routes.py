from fastapi import APIRouter

from app.schemas.product import ProductRequest
from app.schemas.response import (
    ProductProcessResponse
)

from app.services.product_service import (
    ProductService
)

from app.services.taxonomy_service import (
    TaxonomyService
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

from app.config import DATA_DIR


router = APIRouter(
    prefix="/ai",
    tags=["AI"]
)


product_service = ProductService()

understanding_agent = (
    ProductUnderstandingAgent()
)

attribute_agent = (
    AttributeExtractionAgent()
)


taxonomy_service = TaxonomyService(
    DATA_DIR / "taxonomy.csv"
)

classification_agent = ClassificationAgent(
    taxonomy_service.get_taxonomy()
)


@router.post(
    "/process-product",
    response_model=ProductProcessResponse
)
async def process_product(
    product: ProductRequest
):

    # -----------------------------
    # Identity
    # -----------------------------

    manufacturer = (
        product_service.resolve_manufacturer(
            product.part_manuf
        )
    )

    raw_brand = (
        product.e1_brand
        or product.unilog_brand
        or product.dib_brand
    )

    brand = (
        product_service.resolve_brand(
            raw_brand
        )
    )

    # -----------------------------
    # Product understanding
    # -----------------------------

    understanding = (
        understanding_agent.analyze(
            product.mfg_part_num,
            product.part_desc
        )
    )

    # -----------------------------
    # Classification
    # -----------------------------

    classification = (
        classification_agent.classify(
            product.part_desc,
            understanding["product_type"]
        )
    )

    # -----------------------------
    # Attribute extraction
    # -----------------------------

    attributes = (
        attribute_agent.extract(
            product.part_desc
        )
    )

    # -----------------------------
    # Response
    # -----------------------------

    return {

        "product_id":
            product.mfg_part_num,

        "identity": {

            "mpn":
                product.mfg_part_num,

            "manufacturer":
                manufacturer,

            "brand":
                brand
        },

        "understanding":
            understanding,

        "classification":
            classification,

        "attributes":
            attributes,

        "missing_attributes":
            [],

        "processing_status":
            "completed"
    }