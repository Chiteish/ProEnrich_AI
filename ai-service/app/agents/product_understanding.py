import re


class ProductUnderstanding:

    def analyze(self, text: str):

        text_lower = text.lower()

        product_type = self._product_type(text_lower)
        dimensions = self._dimensions(text_lower)
        quantity = self._quantity(text_lower)
        grit = self._grit(text_lower)

        keywords = self._keywords(
            text_lower,
            product_type
        )

        return {
            "product_type": product_type,
            "dimensions": dimensions,
            "quantity": quantity,
            "grit": grit,
            "keywords": keywords
        }

    def _product_type(self, text):

        if "sanding belt" in text:
            return "sanding belt"

        if "sanding" in text and "belt" in text:
            return "sanding belt"

        return None

    def _dimensions(self, text):

        pattern = (
            r"\b\d+(?:/\d+)?\s*x\s*"
            r"\d+(?:/\d+)?"
            r"(?:\s*(?:mm|cm|in|inch|inches))?\b"
        )

        return re.findall(
            pattern,
            text,
            re.IGNORECASE
        )

    def _quantity(self, text):

        patterns = [
            r"\b(\d+)\s*pc\b",
            r"\b(\d+)\s*pcs\b",
            r"\b(\d+)\s*pieces\b",
            r"\bpack\s*of\s*(\d+)\b"
        ]

        for pattern in patterns:

            match = re.search(
                pattern,
                text,
                re.IGNORECASE
            )

            if match:
                return int(match.group(1))

        return None

    def _grit(self, text):

        patterns = [
            r"\b(\d+)\s*[-]?\s*grit\b",
            r"\bgrit\s*[:\-]?\s*(\d+)\b"
        ]

        for pattern in patterns:

            match = re.search(
                pattern,
                text,
                re.IGNORECASE
            )

            if match:
                return match.group(1)

        return None

    def _keywords(self, text, product_type):

        keywords = []

        if "diablo" in text:
            keywords.append("diablo")

        if "sanding" in text:
            keywords.append("sanding")

        if "belt" in text:
            keywords.append("belt")

        return keywords