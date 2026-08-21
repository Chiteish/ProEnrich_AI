from typing import Any
from pydantic import BaseModel


class IdentityValue(BaseModel):
    raw_value: str | None = None
    canonical_value: str | None = None
    confidence: float = 0
    method: str = "unknown"


class Identity(BaseModel):
    mpn: str | None = None
    manufacturer: IdentityValue
    brand: IdentityValue


class Attribute(BaseModel):
    label: str
    value: Any
    uom: str | None = None
    confidence: float = 0
    source: str = "unknown"


class Evidence(BaseModel):
    document_id: str
    source: str
    text: str
    score: float


class Understanding(BaseModel):
    product_type: str | None = None
    dimensions: list[str] = []
    quantity: int | None = None
    grit: str | None = None
    keywords: list[str] = []


class Classification(BaseModel):
    department: str | None = None
    class_name: str | None = None
    fine: str | None = None
    classpath: str | None = None
    confidence: float = 0
    method: str = "no_taxonomy"


class ProductResponse(BaseModel):
    product_id: str
    identity: Identity
    understanding: Understanding
    classification: Classification
    attributes: list[Attribute]
    missing_attributes: list[str]
    evidence: list[Evidence]
    processing_status: str