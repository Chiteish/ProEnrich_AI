from app.agents.attribute_extraction import (
    AttributeExtractor
)


def test_quantity_extraction():

    agent = AttributeExtractor()

    result = agent.extract(
        "Sanding Belt 6pc"
    )

    assert len(result) == 1

    assert result[0]["label"] == \
        "Pack Quantity"

    assert result[0]["value"] == "6"


def test_dimension_extraction():

    agent = AttributeExtractor()

    result = agent.extract(
        "1/2 x 18 inch sanding belt"
    )

    assert len(result) >= 1