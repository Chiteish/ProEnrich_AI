from app.services.entity_resolution import (
    EntityResolver
)


def test_exact_match():

    resolver = EntityResolver(
        [
            "Freud Inc.",
            "Diablo",
            "Bosch"
        ]
    )

    result = resolver.resolve(
        "Diablo"
    )

    assert result["canonical_value"] == "Diablo"
    assert result["confidence"] == 1.0
    assert result["method"] == "exact"


def test_fuzzy_match():

    resolver = EntityResolver(
        [
            "Freud Inc.",
            "Diablo",
            "Bosch"
        ]
    )

    result = resolver.resolve(
        "Freud Inc"
    )

    assert result["canonical_value"] is not None


def test_empty_match():

    resolver = EntityResolver(
        [
            "Freud Inc.",
            "Diablo"
        ]
    )

    result = resolver.resolve(
        None
    )

    assert result["canonical_value"] is None