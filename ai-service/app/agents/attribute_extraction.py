import re


class AttributeExtractionAgent:

    def extract(
        self,
        description: str
    ):

        if not description:
            return []

        attributes = []

        attributes.extend(
            self._extract_dimensions(
                description
            )
        )

        attributes.extend(
            self._extract_quantity(
                description
            )
        )

        attributes.extend(
            self._extract_material(
                description
            )
        )

        return attributes

    def _extract_dimensions(
        self,
        text: str
    ):

        pattern = (
            r"\b\d+(?:/\d+)?\s*x\s*"
            r"\d+(?:/\d+)?"
            r"(?:\s*(?:mm|cm|in|inch|inches|ft))?\b"
        )

        matches = re.findall(
            pattern,
            text.lower()
        )

        if not matches:
            return []

        return [{
            "label": "Dimension",
            "value": matches[0],
            "confidence": 0.90,
            "source": "input"
        }]

    def _extract_quantity(
        self,
        text: str
    ):

        pattern = (
            r"\b(\d+)\s*"
            r"(?:pc|pcs|piece|pieces|pack)\b"
        )

        match = re.search(
            pattern,
            text.lower()
        )

        if not match:
            return []

        return [{
            "label": "Pack Quantity",
            "value": match.group(1),
            "confidence": 0.95,
            "source": "input"
        }]

    def _extract_material(
        self,
        text: str
    ):

        materials = [
            "stainless steel",
            "carbon steel",
            "aluminum",
            "brass",
            "steel",
            "plastic",
            "rubber"
        ]

        lower = text.lower()

        for material in materials:

            if material in lower:

                return [{
                    "label": "Material",
                    "value": material.title(),
                    "confidence": 0.90,
                    "source": "input"
                }]

        return []