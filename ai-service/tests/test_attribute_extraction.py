from app.agents.attribute_extraction import AttributeExtractionAgent

agent = AttributeExtractionAgent()

def test_extract_dimensions():
    text = "Diablo 1/2 x 18 Sanding Belt 6pc"  
    attributes = agent.extract(text)

    labels = [attr.get("label") for attr in attributes if isinstance(attr, dict)]
    assert "Dimension" in labels

    dim_vals = [
        attr.get("value")
        for attr in attributes
        if isinstance(attr, dict) and attr.get("label") == "Dimension"
    ]
    assert any("1/2" in val or "18" in val for val in dim_vals)


def test_extract_pack_quantity():
    text = "Diablo Sanding Belt 6pc"
    attributes = agent.extract(text)

    quantities = [
        attr.get("value")
        for attr in attributes
        if isinstance(attr, dict) and attr.get("label") == "Pack Quantity"
    ]
    assert "6" in quantities


def test_empty_text_extraction():
    attributes = agent.extract("")
    assert attributes == [] or isinstance(attributes, list)