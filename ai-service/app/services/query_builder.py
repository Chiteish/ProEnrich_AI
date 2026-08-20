class ProductQueryBuilder:

    def build(
        self,
        product,
        understanding,
        classification,
        attributes
    ):

        parts = []

        parts.append(
            f"MPN: {product.mfg_part_num}"
        )

        parts.append(
            f"Description: {product.part_desc}"
        )

        if product.part_manuf:

            parts.append(
                f"Manufacturer: "
                f"{product.part_manuf}"
            )

        if understanding.get(
            "product_type"
        ):

            parts.append(
                f"Product Type: "
                f"{understanding['product_type']}"
            )

        if classification.get(
            "classpath"
        ):

            parts.append(
                f"Classification: "
                f"{classification['classpath']}"
            )

        for attribute in attributes:

            parts.append(
                f"{attribute['label']}: "
                f"{attribute['value']}"
            )

        return "\n".join(parts)