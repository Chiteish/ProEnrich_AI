import re


class ProductUnderstandingAgent:

    def analyze(self, part_number: str, description: str):

        text = description or ""

        result = {
            "product_type": None,
            "dimensions": [],
            "quantity": None,
            "keywords": []
        }

        lower = text.lower()

        # Product type heuristics
        product_types = [
            "sanding belt",
            "drill bit",
            "valve",
            "faucet",
            "saw blade",
            "grinding wheel",
            "bearing",
            "motor",
            "switch"
        ]

        for product_type in product_types:
            if product_type in lower:
                result["product_type"] = product_type
                break

        # Dimensions
        dimensions = re.findall(
            r"\b\d+(?:\.\d+)?\s*(?:in|inch|inches|mm|cm|ft)\b",
            lower
        )

        result["dimensions"] = dimensions

        # Quantity
        quantity = re.search(
            r"\b(\d+)\s*(?:pc|pcs|piece|pieces|pack)\b",
            lower
        )

        if quantity:
            result["quantity"] = int(quantity.group(1))

        result["keywords"] = [
            word for word in re.findall(
                r"\b[a-zA-Z]{3,}\b",
                lower
            )
        ][:20]

        return result