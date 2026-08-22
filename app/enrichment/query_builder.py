def build_attribute_query(product, attribute):

    parts = []

    if product.get("mpn"):
        parts.append(f"Product MPN: {product['mpn']}")

    if product.get("manufacturer"):
        parts.append(
            f"Manufacturer: {product['manufacturer']}"
        )

    if product.get("description"):
        parts.append(
            f"Product description: {product['description']}"
        )

    parts.append(
        f"Find the technical specification for: {attribute}"
    )

    return "\n".join(parts)