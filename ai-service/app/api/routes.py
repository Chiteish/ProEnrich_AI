from fastapi import APIRouter

from app.schemas.product import ProductRequest
from app.schemas.response import (
    ProductProcessResponse
)

from app.services.product_service import (
    ProductService
)

from app.agents.product_understanding import (
    ProductUnderstandingAgent
)


router = APIRouter(
    prefix="/ai",
    tags=["AI"]
)


product_service = ProductService()

understanding_agent = (
    ProductUnderstandingAgent()
)


@router.post(
    "/process-product",
    response_model=ProductProcessResponse
)
async def process_product(
    product: ProductRequest
):

    # -------------------------
    # 1. Resolve manufacturer
    # -------------------------

    manufacturer = (
        product_service.resolve_manufacturer(
            product.part_manuf
        )
    )

    # -------------------------
    # 2. Resolve brand
    # -------------------------

    # Priority:
    # E1 → Unilog → DIB

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

    # -------------------------
    # 3. Product understanding
    # -------------------------

    understanding = (
        understanding_agent.analyze(
            product.mfg_part_num,
            product.part_desc
        )
    )

    # -------------------------
    # 4. Return intermediate
    # -------------------------

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

        "attributes": [],

        "missing_attributes": [],

        "processing_status":
            "completed"
    }