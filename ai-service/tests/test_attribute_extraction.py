import pytest
from app.agents.attribute_extraction import AttributeExtractor

@pytest.fixture
def agent():
    return AttributeExtractor()

def test_extract_dimensions(agent):
    text = "Diablo 1/2 x 18 Sanding Belt 6pc"

    attributes = agent.extract(text)

    assert any(
        a["label"] == "Dimension"
        and a["value"] == "1/2 x 18"
        for a in attributes
    )


def test_extract_pack_quantity(agent):
    text = "Diablo Sanding Belt 6pc"

    attributes = agent.extract(text)

    assert any(
        a["label"] == "Pack Quantity"
        and a["value"] == "6"
        for a in attributes
    )


def test_empty_text_extraction(agent):
    attributes = agent.extract("")

    assert attributes == []


def test_grit_extraction(agent):
    attributes = agent.extract(
        "Sanding Belt 6pc 80 Grit"
    )

    assert any(
        a["label"] == "Grit"
        and a["value"] == "80"
        for a in attributes
    )
    
def test_sanding_belt_input(agent):
    description = "Sanding Belt 6pc 80 Grit"
    attributes = agent.extract(description)

    extracted = {attr["label"]: attr["value"] for attr in attributes if isinstance(attr, dict)}

    assert extracted.get("Pack Quantity") == "6"
    assert extracted.get("Grit") == "80"
    
    grit_attr = next(a for a in attributes if a.get("label") == "Grit")
    assert grit_attr == {
        "label": "Grit",
        "value": "80",
        "confidence": 0.95,
        "source": "input"
    }