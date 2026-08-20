from rapidfuzz import process, fuzz


class EntityResolver:

    def __init__(self, entities: list[str]):
        self.entities = [
            entity for entity in entities
            if entity
        ]

    def resolve(self, value: str | None):
        if not value:
            return {
                "raw_value": value,
                "canonical_value": None,
                "confidence": 0.0,
                "method": "none"
            }

        result = process.extractOne(
            value,
            self.entities,
            scorer=fuzz.token_set_ratio
        )

        if not result:
            return {
                "raw_value": value,
                "canonical_value": None,
                "confidence": 0.0,
                "method": "no_match"
            }

        match, score, _ = result

        confidence = score / 100

        if confidence >= 0.90:
            method = "fuzzy_match"

        elif confidence >= 0.70:
            method = "possible_match"

        else:
            return {
                "raw_value": value,
                "canonical_value": None,
                "confidence": confidence,
                "method": "low_confidence"
            }

        return {
            "raw_value": value,
            "canonical_value": match,
            "confidence": confidence,
            "method": method
        }