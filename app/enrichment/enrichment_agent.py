class EnrichmentAgent:

    def enrich(self, product, attribute, retrieved_chunks):

        if not retrieved_chunks:
            return {
                "value": None,
                "confidence": 0.0,
                "status": "NOT_FOUND"
            }

        best_result = retrieved_chunks[0]

        return {
            "value": best_result["text"],
            "confidence": 1.0 / (1.0 + best_result.get("distance", 1.0)),
            "status": "FOUND"
        }