# app/services/missing_attribute_service.py

class MissingAttributeService:
    def __init__(self):
        self.required = {
            "sanding belt": [
                "Dimension",
                "Pack Quantity",
                "Grit",
                "Material"
            ]
        }

    def find_missing(self, product_type: str, attributes: list) -> list:
        if not product_type or not isinstance(product_type, str):
            return []

        expected = self.required.get(product_type.lower(), [])

        # Safely extract labels, guarding against non-dict items
        existing = {
            attr.get("label") 
            for attr in attributes 
            if isinstance(attr, dict) and "label" in attr
        }

        return [attr for attr in expected if attr not in existing]