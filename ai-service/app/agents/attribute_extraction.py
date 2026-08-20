import re


class AttributeExtractionAgent:

    def extract(self, description: str):

        text = description or ""

        attributes = []

        # Dimensions
        dimensions = re.findall(
            r"\b\d+(?:\.\d+)?\s*(?:in|inch|inches|mm|cm|ft)\b",
            text.lower()
        )

        if dimensions:
            attributes.append({
                "label": "Dimension",
                "value": ", ".join(dimensions),
                "confidence": 0.90,
                "source": "input"
            })

        # Quantity
        quantity = re.search(
            r"\b(\d+)\s*(?:pc|pcs|piece|pieces|pack)\b",
            text.lower()
        )

        if quantity:
            attributes.append({
                "label": "Pack Quantity",
                "value": quantity.group(1),
                "confidence": 0.95,
                "source": "input"
            })

        # Material
        materials = [
            "stainless steel",
            "aluminum",
            "brass",
            "steel",
            "plastic",
            "carbon steel"
        ]

        lower = text.lower()

        for material in materials:

            if material in lower:
                attributes.append({
                    "label": "Material",
                    "value": material.title(),
                    "confidence": 0.90,
                    "source": "input"
                })

        return attributes