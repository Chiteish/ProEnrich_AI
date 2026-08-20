from pydantic import BaseModel, Field
from typing import Optional, List


class EntityMatch(BaseModel):
    raw_value: Optional[str] = None
    canonical_value: Optional[str] = None
    confidence: float = 0.0
    method: Optional[str] = None


class ExtractedAttribute(BaseModel):
    label: str
    value: str
    confidence: float
    source: str = "input"


class ClassificationResult(BaseModel):
    department: Optional[str] = None
    class_name: Optional[str] = None
    fine: Optional[str] = None
    classpath: Optional[str] = None
    confidence: float = 0.0


class ProductProcessResponse(BaseModel):
    product_id: str

    identity: dict

    classification: ClassificationResult

    attributes: List[ExtractedAttribute] = Field(
        default_factory=list
    )

    missing_attributes: List[str] = Field(
        default_factory=list
    )

    processing_status: str = "completed"