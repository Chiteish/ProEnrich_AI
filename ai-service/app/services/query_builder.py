class ProductQueryBuilder:

    def build(
        self,
        product_id,
        description,
        understanding
    ):

        parts = [
            product_id,
            description
        ]

        if understanding.get("product_type"):
            parts.append(
                understanding["product_type"]
            )

        parts.extend(
            understanding.get(
                "dimensions", []
            )
        )

        if understanding.get("grit"):
            parts.append(
                f'{understanding["grit"]} grit'
            )

        parts.extend(
            understanding.get(
                "keywords", []
            )
        )

        return " ".join(parts)