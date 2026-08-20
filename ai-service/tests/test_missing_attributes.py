from app.services.missing_attribute_service import MissingAttributeService

missing_service = MissingAttributeService()


def test_find_missing_attributes():
    product_type = "sanding belt"
    extracted_attributes = [
        {"label": "Dimension", "value": "1/2 x 18"},
        {"label": "Pack Quantity", "value": "6"},
    ]

    missing = missing_service.find_missing(product_type, extracted_attributes)

    # Grit and Material should be flagged as missing
    assert "Grit" in missing
    assert "Material" in missing
    assert "Dimension" not in missing
    assert "Pack Quantity" not in missing


def test_no_missing_when_all_present():
    product_type = "sanding belt"
    extracted_attributes = [
        {"label": "Dimension", "value": "1/2 x 18"},
        {"label": "Pack Quantity", "value": "6"},
        {"label": "Grit", "value": "80"},
        {"label": "Material", "value": "Zirconia"},
    ]

    missing = missing_service.find_missing(product_type, extracted_attributes)
    assert missing == []


def test_unknown_product_type():
    missing = missing_service.find_missing("unknown product type", [])
    assert missing == []