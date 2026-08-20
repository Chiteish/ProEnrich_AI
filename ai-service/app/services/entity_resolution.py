from rapidfuzz import process, fuzz

from app.utils.text_normalizer import normalize_entity
from app.config import FUZZY_MATCH_THRESHOLD


class EntityResolver:

    def __init__(
        self,
        canonical_values: list[str]
    ):
        self.canonical_values = canonical_values

        self.normalized_map = {
            normalize_entity(value): value
            for value in canonical_values
            if normalize_entity(value)
        }

        self.normalized_values = list(
            self.normalized_map.keys()
        )

    def resolve(
        self,
        raw_value: str | None
    ) -> dict:

        if not raw_value:
            return {
                "raw_value": raw_value,
                "canonical_value": None,
                "confidence": 0.0,
                "method": "empty"
            }

        normalized = normalize_entity(
            raw_value
        )

        if not normalized:
            return {
                "raw_value": raw_value,
                "canonical_value": None,
                "confidence": 0.0,
                "method": "empty"
            }

        # 1. Exact normalized match
        if normalized in self.normalized_map:

            return {
                "raw_value": raw_value,
                "canonical_value":
                    self.normalized_map[normalized],
                "confidence": 1.0,
                "method": "exact"
            }

        # 2. Fuzzy match
        result = process.extractOne(
            normalized,
            self.normalized_values,
            scorer=fuzz.token_set_ratio
        )

        if result is None:
            return {
                "raw_value": raw_value,
                "canonical_value": None,
                "confidence": 0.0,
                "method": "no_match"
            }

        matched_normalized, score, _ = result

        confidence = score / 100

        if confidence >= FUZZY_MATCH_THRESHOLD:

            return {
                "raw_value": raw_value,
                "canonical_value":
                    self.normalized_map[
                        matched_normalized
                    ],
                "confidence": round(
                    confidence,
                    3
                ),
                "method": "fuzzy"
            }

        return {
            "raw_value": raw_value,
            "canonical_value": None,
            "confidence": round(
                confidence,
                3
            ),
            "method": "low_confidence"
        }