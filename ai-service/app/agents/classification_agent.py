from rapidfuzz import fuzz


class ClassificationAgent:

    def __init__(
        self,
        taxonomy: list[dict]
    ):

        self.taxonomy = taxonomy

    def classify(
        self,
        description: str,
        product_type: str | None = None
    ):

        if not description:
            return self._empty_result()

        text = description.lower()

        best_match = None
        best_score = 0.0

        for item in self.taxonomy:

            searchable_text = " ".join(
                str(value)
                for value in item.values()
                if value is not None
            ).lower()

            score = fuzz.token_set_ratio(
                text,
                searchable_text
            ) / 100

            if (
                product_type
                and product_type.lower()
                in searchable_text
            ):
                score += 0.15

            score = min(score, 1.0)

            if score > best_score:
                best_score = score
                best_match = item

        if best_match is None:
            return self._empty_result()

        return {
            "department":
                best_match.get("Department"),

            "class_name":
                best_match.get("Class"),

            "fine":
                best_match.get("Fine"),

            "classpath":
                best_match.get("ClassPath"),

            "confidence":
                round(best_score, 3),

            "method":
                "taxonomy_similarity"
        }

    def _empty_result(self):

        return {
            "department": None,
            "class_name": None,
            "fine": None,
            "classpath": None,
            "confidence": 0.0,
            "method": "no_match"
        }