def build_enrichment_context(
    product,
    retrieved_chunks
):

    context = "\n\n".join(
        [
            (
                f"Source: {chunk['source']}, "
                f"Page: {chunk['page']}\n"
                f"{chunk['text']}"
            )
            for chunk in retrieved_chunks
        ]
    )

    return {
        "product": product,
        "context": context,
        "instruction": """
Extract ONLY the requested missing attributes.

Use ONLY information present in the provided context.

Do not guess or invent values.

Return JSON.
"""
    }