ATTRIBUTE_REQUIREMENTS = {
    "sanding belts": [
        "Abrasive Material",
        "Grit",
        "Backing Material",
        "Width",
        "Length"
    ],

    "faucets": [
        "Material",
        "Finish",
        "Mounting Type",
        "Flow Rate",
        "Connection Type"
    ],

    "valves": [
        "Material",
        "Valve Type",
        "Connection Type",
        "Pressure Rating",
        "Temperature Rating"
    ]
}


def find_missing_attributes(
    product_type: str | None,
    extracted_attributes: list[dict]
):

    if not product_type:
        return []

    required = ATTRIBUTE_REQUIREMENTS.get(
        product_type.lower(),
        []
    )

    extracted_labels = {
        item["label"].lower()
        for item in extracted_attributes
    }

    return [
        attribute
        for attribute in required
        if attribute.lower() not in extracted_labels
    ]