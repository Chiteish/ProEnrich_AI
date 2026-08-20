class EvidenceService:

    def __init__(
        self,
        min_score: float = 0.70,
        top_k: int = 5
    ):
        self.min_score = min_score
        self.top_k = top_k

    def clean(self, results):

        filtered = [
            r for r in results
            if r.get("score", 0) >= self.min_score
        ]

        # Remove duplicate text
        seen = set()
        unique = []

        for result in filtered:

            text = result.get("text", "").strip().lower()

            if text in seen:
                continue

            seen.add(text)
            unique.append(result)

        return unique[:self.top_k]