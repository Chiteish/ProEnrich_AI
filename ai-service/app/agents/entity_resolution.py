import pandas as pd
from difflib import SequenceMatcher


class EntityResolver:

    def __init__(self, manufacturers_path, brands_path):

        self.manufacturers = pd.read_csv(
            manufacturers_path
        )

        self.brands = pd.read_csv(
            brands_path
        )

    def resolve(
        self,
        raw_value,
        entity_type
    ):

        if not raw_value:
            return {
                "raw_value": raw_value,
                "canonical_value": None,
                "confidence": 0,
                "method": "empty"
            }

        if raw_value.strip().lower() == "-- unbranded --":

            return {
                "raw_value": raw_value,
                "canonical_value": None,
                "confidence": 1,
                "method": "placeholder"
            }

        df = (
            self.manufacturers
            if entity_type == "manufacturer"
            else self.brands
        )

        for _, row in df.iterrows():

            candidate = str(
                row["raw_name"]
            )

            if candidate.lower() == raw_value.lower():

                return {
                    "raw_value": raw_value,
                    "canonical_value":
                        row["canonical_name"],
                    "confidence": 1,
                    "method": "exact"
                }

        best = None
        best_score = 0

        for _, row in df.iterrows():

            candidate = str(
                row["raw_name"]
            )

            score = SequenceMatcher(
                None,
                raw_value.lower(),
                candidate.lower()
            ).ratio()

            if score > best_score:

                best_score = score
                best = row

        if best is not None and best_score >= 0.80:

            return {
                "raw_value": raw_value,
                "canonical_value":
                    best["canonical_name"],
                "confidence":
                    round(best_score, 2),
                "method": "fuzzy"
            }

        return {
            "raw_value": raw_value,
            "canonical_value": None,
            "confidence": 0,
            "method": "no_match"
        }