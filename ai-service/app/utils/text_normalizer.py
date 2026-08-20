import re


def normalize_text(value: str | None) -> str:
    if not value:
        return ""

    value = value.strip().lower()

    value = re.sub(r"\s+", " ", value)

    value = re.sub(r"[^\w\s.-]", " ", value)

    value = re.sub(r"\s+", " ", value)

    return value.strip()


def is_empty_value(value: str | None) -> bool:
    if not value:
        return True

    normalized = normalize_text(value)

    empty_values = {
        "",
        "--",
        "n/a",
        "na",
        "none",
        "null",
        "unknown",
        "unbranded",
        "no unilog brand",
        "no dib brand",
    }

    return normalized in empty_values