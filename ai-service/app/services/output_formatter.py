class OutputFormatter:

    def format_attributes(
        self,
        attributes
    ):

        output = {}

        for index, attribute in enumerate(
            attributes[:50],
            start=1
        ):

            output[
                f"ATTRIBUTE_LABEL {index}"
            ] = attribute.get("label")

            output[
                f"ATTRIBUTE_VALUE {index}"
            ] = attribute.get("value")

            output[
                f"ATTRIBUTE_UOM {index}"
            ] = attribute.get("uom")

        return output

    def format_product(
        self,
        product
    ):

        output = {
            "PRODUCT_ID":
                product["product_id"],

            "MANUFACTURER_NAME":
                product["identity"]
                ["manufacturer"]
                ["canonical_value"],

            "BRAND_NAME":
                product["identity"]
                ["brand"]
                ["canonical_value"],

            "MANUFACTURER_PART_NUMBER":
                product["identity"]["mpn"],

            "Dept":
                product["classification"]
                ["department"],

            "Class":
                product["classification"]
                ["class_name"],

            "Fine":
                product["classification"]
                ["fine"],

            "Classpath":
                product["classification"]
                ["classpath"]
        }

        output.update(
            self.format_attributes(
                product["attributes"]
            )
        )

        return output