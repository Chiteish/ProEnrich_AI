class ProductQueryBuilder:
    def build(self, product, understanding, classification, attributes):
        parts = []

        # 1. Product details (supports Pydantic model or dict)
        mfg_part_num = getattr(product, "mfg_part_num", None) or (product.get("mfg_part_num") if isinstance(product, dict) else None)
        part_desc = getattr(product, "part_desc", None) or (product.get("part_desc") if isinstance(product, dict) else None)

        if mfg_part_num:
            parts.append(str(mfg_part_num))
        if part_desc:
            parts.append(str(part_desc))

        # 2. Understanding (product type and dimensions)
        if isinstance(understanding, dict):
            if understanding.get("product_type"):
                parts.append(str(understanding["product_type"]))
            if understanding.get("dimensions"):
                dims = understanding["dimensions"]
                if isinstance(dims, list):
                    parts.extend([str(d) for d in dims])
                else:
                    parts.append(str(dims))

        # 3. Attributes (extracted values)
        if isinstance(attributes, list):
            for attr in attributes:
                if isinstance(attr, dict) and attr.get("value"):
                    parts.append(str(attr["value"]))

        # Deduplicate terms while preserving order
        seen = set()
        unique_parts = []
        for part in parts:
            p_lower = part.strip().lower()
            if p_lower and p_lower not in seen:
                seen.add(p_lower)
                unique_parts.append(part.strip())

        return " ".join(unique_parts)