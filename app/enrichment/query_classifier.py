def classify_query(query: str):

    query = query.lower().strip()

    if any(word in query for word in ["compare", "comparison", "difference", "versus", " vs "]):
        return "comparison"

    if any(
        word in query
        for word in [
            "voltage",
            "material",
            "weight",
            "pressure",
            "dimension",
            "rating",
            "brand",
            "manufacturer",
            "model",
            "size",
            "color",
        ]
    ):
        return "attribute"

    return "product"