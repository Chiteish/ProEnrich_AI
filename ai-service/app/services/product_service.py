from app.config import (
    MANUFACTURER_FILE,
    BRAND_FILE
)

from app.services.data_loader import (
    load_single_column_csv
)

from app.services.entity_resolution import (
    EntityResolver
)

from app.utils.text_normalizer import (
    is_placeholder
)


class ProductService:

    def __init__(self):

        manufacturers = load_single_column_csv(
            MANUFACTURER_FILE
        )

        brands = load_single_column_csv(
            BRAND_FILE
        )

        self.manufacturer_resolver = (
            EntityResolver(manufacturers)
        )

        self.brand_resolver = (
            EntityResolver(brands)
        )

    def resolve_manufacturer(
        self,
        value: str | None
    ):

        if is_placeholder(value):
            return {
                "raw_value": value,
                "canonical_value": None,
                "confidence": 1.0,
                "method": "placeholder"
            }

        return self.manufacturer_resolver.resolve(
            value
        )

    def resolve_brand(
        self,
        value: str | None
    ):

        if is_placeholder(value):
            return {
                "raw_value": value,
                "canonical_value": None,
                "confidence": 1.0,
                "method": "placeholder"
            }

        return self.brand_resolver.resolve(
            value
        )