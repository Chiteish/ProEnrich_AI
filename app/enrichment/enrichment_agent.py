import re


class EnrichmentAgent:

    def __init__(self):
        pass

    def extract_dimensions_from_text(self, text: str) -> dict:
        dimensions = {
            "LENGTH": None,
            "WIDTH": None,
            "HEIGHT": None
        }

        # Number pattern supporting mixed numbers like 33-7/16, fractions 7/16, decimals 24.25, integers 24
        num_pat = r"(\d+[\s\-]\d+/\d+|\d+/\d+|\d+(?:\.\d+)?)"
        unit_opt = r"(in|inch|inches|mm|cm|m|ft|feet|\"|')?\.?"

        # Pattern 1: e.g. "33-7/16 in H x 23-7/8 in W x 22-5/8 in D" or "24 in W x 24-1/4 in D" or '24"W x 24.25"D x 34"H'
        dim_item_pattern = rf"\b{num_pat}\s*{unit_opt}\s*(?:in\s+)?([HWDL]|Height|Width|Depth|Length)\b"
        matches = list(re.finditer(dim_item_pattern, text, re.IGNORECASE))
        if matches:
            for match in matches:
                val = match.group(1).strip()
                unit = match.group(2) or "in"
                dim_type = match.group(3).upper()

                if unit in ['"', "in", "inch", "inches"]:
                    formatted_val = f"{val} in"
                elif unit in ["'", "ft", "feet"]:
                    formatted_val = f"{val} ft"
                else:
                    formatted_val = f"{val} {unit}".strip()

                if dim_type in ["H", "HEIGHT"] and not dimensions["HEIGHT"]:
                    dimensions["HEIGHT"] = formatted_val
                elif dim_type in ["W", "WIDTH"] and not dimensions["WIDTH"]:
                    dimensions["WIDTH"] = formatted_val
                elif dim_type in ["L", "LENGTH", "D", "DEPTH"] and not dimensions["LENGTH"]:
                    dimensions["LENGTH"] = formatted_val

        # Pattern 2: e.g. "Dimensions: 500 x 300 x 120 mm" or "500mm x 300mm x 120mm" (L x W x H)
        triple_pattern = rf"(?:dimensions|size)?[:\s]*{num_pat}\s*{unit_opt}\s*[xX*×]\s*{num_pat}\s*{unit_opt}\s*[xX*×]\s*{num_pat}\s*{unit_opt}"
        triple_match = re.search(triple_pattern, text, re.IGNORECASE)
        if triple_match:
            v1, u1, v2, u2, v3, u3 = triple_match.groups()
            common_unit = u3 or u2 or u1 or "in"
            if common_unit == '"':
                common_unit = "in"
            if not dimensions["LENGTH"]:
                dimensions["LENGTH"] = f"{v1} {common_unit}".strip()
            if not dimensions["WIDTH"]:
                dimensions["WIDTH"] = f"{v2} {common_unit}".strip()
            if not dimensions["HEIGHT"]:
                dimensions["HEIGHT"] = f"{v3} {common_unit}".strip()

        # Pattern 3: e.g. "24 x 24-1/4 in" (Width x Depth / Length)
        double_pattern = rf"(?:dimensions|size)?[:\s]*{num_pat}\s*{unit_opt}\s*[xX*×]\s*{num_pat}\s*{unit_opt}"
        double_match = re.search(double_pattern, text, re.IGNORECASE)
        if double_match and (not dimensions["WIDTH"] or not dimensions["LENGTH"]):
            v1, u1, v2, u2 = double_match.groups()
            common_unit = u2 or u1 or "in"
            if common_unit == '"':
                common_unit = "in"
            if not dimensions["WIDTH"]:
                dimensions["WIDTH"] = f"{v1} {common_unit}".strip()
            if not dimensions["LENGTH"]:
                dimensions["LENGTH"] = f"{v2} {common_unit}".strip()

        return dimensions

    def extract_structured_attributes(self, texts: list[str]) -> dict:
        combined_text = "\n".join(texts)

        results = {
            "LENGTH": None,
            "WIDTH": None,
            "HEIGHT": None,
            "WEIGHT": None,
            "VOLUME": None,
            "UPC": None,
            "GTIN": None,
            "UNSPSC": None
        }

        num_pat = r"(\d+[\s\-]\d+/\d+|\d+/\d+|\d+(?:\.\d+)?)"

        # 1. Direct CSV / structured key-value pattern: e.g. "LENGTH: 24 | LENGTH_UOM: in"
        for attr in ["LENGTH", "WIDTH", "HEIGHT", "WEIGHT", "VOLUME", "UPC", "GTIN", "UNSPSC"]:
            # Check CSV style: ATTR: val | ATTR_UOM: uom
            csv_style = re.search(
                rf"\b{attr}\s*:\s*([^\|\n,;]+?)(?:\s*\|\s*{attr}_UOM\s*:\s*([^\|\n,;]+?))?(?=\s*(?:\||\n|,|;|\.(?:\s+|$)|$))",
                combined_text,
                re.IGNORECASE
            )
            if csv_style:
                val = csv_style.group(1).strip()
                uom = csv_style.group(2).strip() if csv_style.group(2) else ""
                if val and val.lower() not in ["none", "null", "n/a", ""]:
                    if uom and uom.lower() not in ["none", "null", "n/a", ""]:
                        results[attr] = f"{val} {uom}".strip()
                    else:
                        results[attr] = val

            # Check ATTRIBUTE_LABEL style: ATTRIBUTE_LABEL \d+: attr | ATTRIBUTE_VALUE \d+: val | ATTRIBUTE_UOM \d+: uom
            attr_label_match = re.search(
                rf"ATTRIBUTE_LABEL\s*\d*\s*:\s*{attr}\s*\|\s*ATTRIBUTE_VALUE\s*\d*\s*:\s*([^\|\n,;]+?)(?:\s*\|\s*ATTRIBUTE_UOM\s*\d*\s*:\s*([^\|\n,;]+?))?(?=\s*(?:\||\n|,|;|\.(?:\s+|$)|$))",
                combined_text,
                re.IGNORECASE
            )
            if attr_label_match and not results[attr]:
                val = attr_label_match.group(1).strip()
                uom = attr_label_match.group(2).strip() if attr_label_match.group(2) else ""
                if val and val.lower() not in ["none", "null", "n/a", ""]:
                    if uom and uom.lower() not in ["none", "null", "n/a", ""]:
                        results[attr] = f"{val} {uom}".strip()
                    else:
                        results[attr] = val

        # 2. Dimensions from free-form text or multi-dimensional strings
        dims = self.extract_dimensions_from_text(combined_text)
        for d in ["LENGTH", "WIDTH", "HEIGHT"]:
            if not results[d] and dims[d]:
                results[d] = dims[d]

        # 3. Specific attribute regexes for remaining fields
        # Length
        if not results["LENGTH"]:
            m = re.search(rf"\b(?:Length|Depth|Minimum Height|Depth With Door Open)[:\s=]+{num_pat}\s*(in|inch|inches|mm|cm|m|ft|\"|')?\.?", combined_text, re.IGNORECASE)
            if m:
                val, uom = m.groups()
                results["LENGTH"] = f"{val} {uom or 'in'}".strip() if uom != '"' else f"{val} in"

        # Width
        if not results["WIDTH"]:
            m = re.search(rf"\b(?:Width|Overall Width)[:\s=]+{num_pat}\s*(in|inch|inches|mm|cm|m|ft|\"|')?\.?", combined_text, re.IGNORECASE)
            if m:
                val, uom = m.groups()
                results["WIDTH"] = f"{val} {uom or 'in'}".strip() if uom != '"' else f"{val} in"

        # Height
        if not results["HEIGHT"]:
            m = re.search(rf"\b(?:Height|Overall Height)[:\s=]+{num_pat}\s*(in|inch|inches|mm|cm|m|ft|\"|')?\.?", combined_text, re.IGNORECASE)
            if m:
                val, uom = m.groups()
                results["HEIGHT"] = f"{val} {uom or 'in'}".strip() if uom != '"' else f"{val} in"

        # Weight
        if not results["WEIGHT"] or not any(char.isdigit() for char in str(results["WEIGHT"])):
            m = re.search(rf"\b(?:Weight|Net Weight|Gross Weight|Item Weight|Shipping Weight)[:\s=]+{num_pat}\s*(lbs|lb|pounds|kg|kilograms|g|grams|oz|ounces)\b", combined_text, re.IGNORECASE)
            if m:
                val, uom = m.groups()
                results["WEIGHT"] = f"{val} {uom}".strip()

        # Volume
        if not results["VOLUME"] or not any(char.isdigit() for char in str(results["VOLUME"])):
            m = re.search(rf"\b(?:Volume|Capacity|Capacity Volume)[:\s=]+{num_pat}\s*(cu\s*ft|cubic\s*feet|cu\s*in|L|liters|litres|mL|m3|gal|gallons)\b", combined_text, re.IGNORECASE)
            if m:
                val, uom = m.groups()
                results["VOLUME"] = f"{val} {uom}".strip()

        # UPC (12 digits)
        if not results["UPC"]:
            m = re.search(r"\bUPC(?: Code)?[:\s=]+(\d{12})\b", combined_text, re.IGNORECASE)
            if m:
                results["UPC"] = m.group(1)

        # GTIN (8, 12, 13, 14 digits)
        if not results["GTIN"]:
            m = re.search(r"\b(?:GTIN(?:-14|-12|-13|-8)?|EAN(?:-13|-8)?|Barcode)[:\s=]+(\d{8,14})\b", combined_text, re.IGNORECASE)
            if m:
                results["GTIN"] = m.group(1)
            elif results["UPC"]:
                # 12-digit UPC can serve as GTIN-12
                results["GTIN"] = results["UPC"]

        # UNSPSC (8 or 10 digits)
        if not results["UNSPSC"]:
            m = re.search(r"\bUNSPSC(?: Code)?[:\s=]+(\d{8,10})\b", combined_text, re.IGNORECASE)
            if m:
                results["UNSPSC"] = m.group(1)

        def _clean_val(val):
            if val is None:
                return None
            val_str = str(val).strip()
            val_lower = val_str.lower()
            placeholders = [
                "none", "null", "n/a", "", 
                "-- no dib brand --", "-- no unilog brand --", "-- unbranded --", "-- no brand --",
                "no dib brand", "no unilog brand", "unbranded"
            ]
            if val_lower in placeholders:
                return None
            return val_str

        # Clean all values before returning
        for k in results:
            results[k] = _clean_val(results[k])

        return results

    def extract_attribute(self, attribute: str, texts: list[str]) -> tuple[str | None, float]:
        combined_text = "\n".join(texts)
        if not combined_text.strip():
            return None, 0.0

        def _clean_val(val):
            if val is None:
                return None
            val_str = str(val).strip()
            val_lower = val_str.lower()
            placeholders = [
                "none", "null", "n/a", "", 
                "-- no dib brand --", "-- no unilog brand --", "-- unbranded --", "-- no brand --",
                "no dib brand", "no unilog brand", "unbranded"
            ]
            if val_lower in placeholders:
                return None
            return val_str

        structured = self.extract_structured_attributes(texts)
        attr_upper = attribute.upper()
        if attr_upper in structured and structured[attr_upper] is not None:
            return structured[attr_upper], 0.95

        # Generic key-value match
        pattern = rf"\b{re.escape(attribute)}[:\s=]+([^\|\n,\;]+)"
        match = re.search(pattern, combined_text, re.IGNORECASE)
        if match:
            val = _clean_val(match.group(1))
            if val is not None:
                return val, 0.85

        return None, 0.0

    def enrich(self, product, attribute, retrieved_chunks):
        if not retrieved_chunks:
            return {
                "value": None,
                "confidence": 0.0,
                "status": "NOT_FOUND"
            }

        texts = [chunk.get("text", "") for chunk in retrieved_chunks]
        val, conf = self.extract_attribute(attribute, texts)

        if val is not None:
            return {
                "value": val,
                "confidence": conf,
                "status": "FOUND"
            }

        best_result = retrieved_chunks[0]

        return {
            "value": best_result["text"],
            "confidence": 1.0 / (1.0 + best_result.get("distance", 1.0)),
            "status": "FOUND"
        }