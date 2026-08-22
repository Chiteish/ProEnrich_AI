from app.agents.classification_agent import (
    ClassificationAgent
)


def test_empty_classification():

    agent = ClassificationAgent([])

    result = agent.classify(
        "unknown product"
    )

    assert result["confidence"] == 0.0