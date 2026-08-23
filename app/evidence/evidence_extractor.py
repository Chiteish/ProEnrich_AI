def extract_evidence(results):

    evidence = []

    for result in results:

        evidence.append({
            "source": result.get("source", "unknown"),
            "source_url": result.get("source_url"),
            "product_id": result.get("product_id"),
            "page": result.get("page"),
            "text": result.get("text", ""),
            "similarity_distance": result.get("distance"),
            "rank": result.get("rank")
        })

    return evidence