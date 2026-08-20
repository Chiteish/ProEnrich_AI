from typing import Optional
from pydantic import BaseModel, Field


class EntityMatch(BaseModel):

    raw_value: Optional[str] = None

    canonical_value: Optional[str] = None

    confidence: float = 0.0

    method: str


class ProductIdentity(BaseModel):

    mpn: str

    manufacturer: EntityMatch

    brand: EntityMatch


class ProductUnderstanding(BaseModel):

    product_type: Optional[str] = None

    dimensions: list[str] = Field(
        default_factory=list
    )

    quantity: Optional[int] = None

    keywords: list[str] = Field(
        default_factory=list
    )


class ProductProcessResponse(BaseModel):

    product_id: str

    identity: ProductIdentity

    understanding: ProductUnderstanding

    attributes: list[dict] = Field(
        default_factory=list
    )

    missing_attributes: list[str] = Field(
        default_factory=list
    )

    processing_status: str