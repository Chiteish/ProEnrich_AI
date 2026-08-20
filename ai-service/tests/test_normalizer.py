from app.utils.text_normalizer import (
    normalize_text,
    normalize_entity,
    is_placeholder
)


def test_normalize_text():

    result = normalize_text(
        "  Hello   WORLD  "
    )

    assert result == "hello world"


def test_normalize_entity():

    result = normalize_entity(
        "Freud Inc (2435)"
    )

    assert result == "freud inc"


def test_placeholder():

    assert is_placeholder(
        "-- Unbranded --"
    )

    assert is_placeholder(
        "-- No DIB Brand --"
    )


def test_real_value_not_placeholder():

    assert not is_placeholder(
        "Diablo"
    )