import re
import unicodedata

PLACEHOLDER_VALUES = {
    "",
    "--",
    "n/a",
    "na",
    "none",
    "null",
    "unknown",
    "unbranded",
    "-- unbranded --",
    "no unilog brand",
    "-- no unilog brand --",
    "no dib brand",
    "-- no dib brand --",
}


def normalize_text(value: str | None) -> str:
    """General text normalization."""
    if value is None:
        return ""

    value = str(value)
    value = unicodedata.normalize("NFKC", value)
    value = value.strip().lower()
    value = re.sub(r"\s+", " ", value)

    return value


def normalize_entity(value: str | None) -> str:
    """Normalization specifically for brands/manufacturers."""
    value = normalize_text(value)

    if not value:
        return ""

    # Remove content inside parentheses
    value = re.sub(r"\([^)]*\)", "", value)

    # Remove common punctuation
    value = re.sub(r"[^\w\s]", " ", value)
    value = re.sub(r"\s+", " ", value)

    return value.strip()


def is_placeholder(value: str | None) -> bool:
    normalized = normalize_text(value)

    if normalized in PLACEHOLDER_VALUES:
        return True

    # Strip surrounding non-alphanumeric chars (e.g. "-- unbranded --" -> "unbranded")
    stripped = re.sub(r"^[^\w]+|[^\w]+$", "", normalized).strip()
    return stripped in PLACEHOLDER_VALUES