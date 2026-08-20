class ClassificationAgent:

    def __init__(self, taxonomy: list[dict]):
        self.taxonomy = taxonomy

    def classify(self, description: str):

        text = description.lower()

        candidates = []

        for item in self.taxonomy:

            keywords = item.get("keywords", [])

            score = sum(
                1 for keyword in keywords
                if keyword.lower() in text
            )

            if score > 0:
                candidates.append(
                    (score, item)
                )

        if not candidates:
            return {
                "department": None,
                "class_name": None,
                "fine": None,
                "classpath": None,
                "confidence": 0.0
            }

        candidates.sort(
            key=lambda x: x[0],
            reverse=True
        )

        score, best = candidates[0]

        confidence = min(
            0.95,
            0.5 + score * 0.1
        )

        return {
            "department": best.get("department"),
            "class_name": best.get("class_name"),
            "fine": best.get("fine"),
            "classpath": best.get("classpath"),
            "confidence": confidence
        }