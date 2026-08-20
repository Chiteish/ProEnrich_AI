import re


class ProductUnderstandingAgent:

    def analyze(
        self,
        part_number: str,
        description: str
    ):
        text = description or ""
        lower = text.lower()

        product_type = self._detect_product_type(lower)
        dimensions = self._extract_dimensions(lower)
        quantity = self._extract_quantity(lower)

        return {
            "product_type": product_type,
            "dimensions": dimensions,
            "quantity": quantity,
            "keywords": self._extract_keywords(lower)
        }

    def _detect_product_type(self, text: str):
        product_types = [
            "sanding belt",
            "drill bit",
            "saw blade",
            "grinding wheel",
            "faucet",
            "valve",
            "bearing",
            "motor",
            "switch",
            "pipe fitting"
        ]

        for product_type in product_types:
            if product_type in text:
                return product_type

        return None

    def _extract_dimensions(self, text: str):
        patterns = [
            # Cross dimensions with fractions or decimals (e.g., "1/2 x 18", "1/2in x 18in", "12.5 x 18 mm")
            r"\b\d+(?:/\d+|\.\d+)?\s*(?:in|inch|inches|mm|cm|ft)?\s*x\s*\d+(?:/\d+|\.\d+)?\s*(?:in|inch|inches|mm|cm|ft)?\b",
            # Single unit dimensions (e.g., "18 in", "1/2 inch", "5mm")
            r"\b\d+(?:/\d+|\.\d+)?\s*(?:in|inch|inches|mm|cm|ft)\b"
        ]

        matches = []
        for pattern in patterns:
            found = re.findall(pattern, text)
            for m in found:
                if m not in matches:
                    matches.append(m)

        return matches

    def _extract_quantity(self, text: str):
        pattern = r"\b(\d+)\s*(?:pc|pcs|piece|pieces|pack)\b"
        match = re.search(pattern, text)

        if match:
            return int(match.group(1))

        return None

    def _extract_keywords(self, text: str):
        words = re.findall(r"\b[a-zA-Z]{3,}\b", text)
        return list(dict.fromkeys(words))[:20]