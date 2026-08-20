def confidence_status(
    confidence: float
) -> str:

    if confidence >= 0.90:
        return "high"

    if confidence >= 0.75:
        return "medium"

    return "low"