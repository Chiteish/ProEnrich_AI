def extract_evidence(results):

    evidence = []

    for result in results:

        evidence.append({
            "source": result["source"],
            "page": result["page"],
            "text": result["text"],
            "similarity_distance": result["distance"]
        })

    return evidence