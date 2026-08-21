class EvidenceService:

    def __init__(
        self,
        min_score=0.70,
        top_k=5
    ):

        self.min_score = min_score
        self.top_k = top_k

    def clean(self, results):

        results = [
            r for r in results
            if r.get("score", 0)
            >= self.min_score
        ]

        seen = set()
        unique = []

        for result in results:

            text = result.get(
                "text",
                ""
            ).strip().lower()

            if text in seen:
                continue

            seen.add(text)
            unique.append(result)

        return unique[:self.top_k]