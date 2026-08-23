import re

from app.agents.product_understanding import ProductUnderstanding


def _clean(val) -> str | None:
    """Return stripped string or None for blanks/placeholders."""
    if val is None:
        return None
    s = str(val).strip()
    if not s or s.lower() in {"none", "null", "n/a", "na"}:
        return None
    return s


def _parse_dim_string(text: str) -> list[dict]:
    """
    Parse a dimension string like '5"x.045"x7/8"' or '4-1/2"x1/4"x7/8"'
    into a list of {label, value, uom} dicts (Diameter, Thickness, Arbor Size).
    Also handles '1/2"x18"' (Width x Length).
    """
    # Match sequences of <num>"  separated by x
    parts = re.findall(
        r'(\d+(?:[/\-]\d+)?(?:\.\d+)?)\s*(["\']|in\b|mm\b|cm\b)?',
        text,
        re.IGNORECASE,
    )
    numeric_parts = [(v, u or '"') for v, u in parts if v]
    return numeric_parts


class AttributeExtractor:

    def __init__(self):
        self.understanding_agent = ProductUnderstanding()

    def extract(self, input_data, part_desc: str = "") -> list[dict]:
        if isinstance(input_data, str):
            understanding = self.understanding_agent.analyze(input_data)
            part_desc = input_data
        else:
            understanding = input_data

        product_type = (understanding.get("product_type") or "").lower()
        attributes: list[dict] = []

        # ── Dispatch to product-family extractor ────────────────────────────
        if "sanding belt" in product_type:
            attributes = self._extract_abrasive_belt(part_desc, understanding)
        elif "sanding disc" in product_type or "film disc" in product_type:
            attributes = self._extract_abrasive_disc(part_desc, understanding)
        elif "cut-off disc" in product_type or "cut-off wheel" in product_type:
            attributes = self._extract_cutoff(part_desc, understanding)
        elif "grinding wheel" in product_type:
            attributes = self._extract_grinding_wheel(part_desc, understanding)
        elif "dishwasher" in product_type:
            attributes = self._extract_dishwasher(part_desc, understanding)
        elif "dryer" in product_type or "washer" in product_type or "laundry" in product_type:
            attributes = self._extract_laundry(part_desc, understanding)
        elif "led bulb" in product_type or "fluorescent" in product_type or "hid" in product_type:
            attributes = self._extract_bulb(part_desc, understanding)
        elif "ceiling fan" in product_type:
            attributes = self._extract_fan(part_desc, understanding)
        elif "drill bit" in product_type:
            attributes = self._extract_drill_bit(part_desc, understanding)
        elif "router bit" in product_type:
            attributes = self._extract_router_bit(part_desc, understanding)
        elif "decking" in product_type or "railing" in product_type:
            attributes = self._extract_decking(part_desc, understanding)
        else:
            attributes = self._extract_generic(part_desc, understanding)

        return attributes

    # ── Helpers ──────────────────────────────────────────────────────────────

    def _attr(self, label, value, uom=None, confidence=0.90, source="input"):
        v = _clean(value)
        if v is None:
            return None
        return {"label": label, "value": v, "uom": uom, "confidence": confidence, "source": source}

    def _add(self, attrs: list, label, value, uom=None, confidence=0.90, source="input"):
        a = self._attr(label, value, uom, confidence, source)
        if a:
            attrs.append(a)

    # ── Abrasive belt ────────────────────────────────────────────────────────
    def _extract_abrasive_belt(self, text: str, und: dict) -> list[dict]:
        attrs = []
        # Dimension e.g. 1/2"x18", 3"x24"
        dim_match = re.search(
            r'(\d+(?:[/\-]\d+)?(?:\.\d+)?)\s*["\']?\s*[xX]\s*(\d+(?:[/\-]\d+)?(?:\.\d+)?)\s*(["\']|in\b)?',
            text
        )
        if dim_match:
            w, l, _ = dim_match.groups()
            self._add(attrs, "Width", w, "in")
            self._add(attrs, "Length", l, "in")
            self._add(attrs, "Dimension", f'{w}" x {l}"')
        if und.get("grit"):
            self._add(attrs, "Grit", und["grit"])
        if und.get("quantity"):
            self._add(attrs, "Pack Quantity", str(und["quantity"]))
        return attrs

    # ── Abrasive disc ────────────────────────────────────────────────────────
    def _extract_abrasive_disc(self, text: str, und: dict) -> list[dict]:
        attrs = []
        diam_m = re.search(r'(\d+(?:\.\d+)?)\s*["\']?\s*(?:inch|in\b|diameter)', text, re.IGNORECASE)
        if not diam_m:
            diam_m = re.search(r'(\d+(?:\.\d+)?)\s*["\']', text)
        if diam_m:
            self._add(attrs, "Diameter", diam_m.group(1), "in")
        if und.get("grit"):
            self._add(attrs, "Grit", und["grit"])
        if und.get("quantity"):
            self._add(attrs, "Pack Quantity", str(und["quantity"]))
        # Disc size from dimensions list
        for dim in und.get("dimensions", []):
            self._add(attrs, "Dimension", dim)
            break
        return attrs

    # ── Cut-off disc ─────────────────────────────────────────────────────────
    def _extract_cutoff(self, text: str, und: dict) -> list[dict]:
        attrs = []
        # Format: 5"x.045"x7/8"  (diameter x thickness x arbor)
        m = re.search(
            r'(\d+(?:[\/\-]\d+)?(?:\.\d+)?)\s*["\']?\s*[xX]\s*'
            r'(\d+(?:[\/\-]\d+)?(?:\.\d+)?)\s*["\']?\s*[xX]\s*'
            r'(\d+(?:[\/\-]\d+)?(?:\.\d+)?)\s*(["\']|mm\b|in\b)?',
            text
        )
        if m:
            diam, thick, arbor, unit = m.groups()
            u = "in"
            self._add(attrs, "Diameter", diam, u)
            self._add(attrs, "Thickness", thick, u)
            self._add(attrs, "Arbor Size", arbor, u)
        else:
            # 2-part: diameter x thickness
            m2 = re.search(
                r'(\d+(?:[\/\-]\d+)?(?:\.\d+)?)\s*["\']?\s*[xX]\s*(\d+(?:[\/\-]\d+)?(?:\.\d+)?)\s*(["\']|mm\b)?',
                text
            )
            if m2:
                diam, thick, _ = m2.groups()
                self._add(attrs, "Diameter", diam, "in")
                self._add(attrs, "Thickness", thick, "in")
        # Application
        app_m = re.search(r'\b(Metal|Masonry|Steel|Aluminum|Wood|Stainless)\b', text, re.IGNORECASE)
        if app_m:
            self._add(attrs, "Application", app_m.group(1).title())
        if und.get("quantity"):
            self._add(attrs, "Pack Quantity", str(und["quantity"]))
        return attrs

    # ── Grinding wheel ───────────────────────────────────────────────────────
    def _extract_grinding_wheel(self, text: str, und: dict) -> list[dict]:
        attrs = []
        m = re.search(
            r'(\d+(?:[\/\-]\d+)?(?:\.\d+)?)\s*["\']?\s*[xX]\s*'
            r'(\d+(?:[\/\-]\d+)?(?:\.\d+)?)\s*["\']?\s*[xX]\s*'
            r'(\d+(?:[\/\-]\d+)?(?:\.\d+)?)\s*(["\']|mm\b)?',
            text
        )
        if m:
            diam, thick, arbor, _ = m.groups()
            self._add(attrs, "Diameter", diam, "in")
            self._add(attrs, "Thickness", thick, "in")
            self._add(attrs, "Arbor Size", arbor, "in")
        app_m = re.search(r'\b(Metal|Masonry|Steel|Aluminum|Wood)\b', text, re.IGNORECASE)
        if app_m:
            self._add(attrs, "Application", app_m.group(1).title())
        return attrs

    # ── Dishwasher ───────────────────────────────────────────────────────────
    def _extract_dishwasher(self, text: str, und: dict) -> list[dict]:
        attrs = []
        # Voltage
        v_m = re.search(r'(\d+)\s*V\b', text, re.IGNORECASE)
        if v_m:
            self._add(attrs, "Voltage Rating", v_m.group(1), "V")
        # Amperage
        a_m = re.search(r'(\d+)\s*A\b', text, re.IGNORECASE)
        if a_m:
            self._add(attrs, "Amperage Rating", a_m.group(1), "A")
        # Sound level
        db_m = re.search(r'(\d+)\s*(?:DBA|dBA|dB)\b', text, re.IGNORECASE)
        if db_m:
            self._add(attrs, "Sound Level", db_m.group(1), "dBA")
        # Material
        mat_m = re.search(r'\b(Stainless Steel|Black|White|Bisque)\b', text, re.IGNORECASE)
        if mat_m:
            self._add(attrs, "Material", mat_m.group(1).title())
        return attrs

    # ── Laundry appliances ───────────────────────────────────────────────────
    def _extract_laundry(self, text: str, und: dict) -> list[dict]:
        attrs = []
        text_l = text.lower()
        fuel = "Gas" if "gas" in text_l else ("Electric" if any(w in text_l for w in ["elect", "electric"]) else None)
        if fuel:
            self._add(attrs, "Fuel Type", fuel)
        # Colour
        col_m = re.search(r'\b(White|Black|Biscuit|Graphite|Silver)\b', text, re.IGNORECASE)
        if col_m:
            self._add(attrs, "Color", col_m.group(1).title())
        return attrs

    # ── Light bulbs ──────────────────────────────────────────────────────────
    def _extract_bulb(self, text: str, und: dict) -> list[dict]:
        attrs = []
        # Wattage  e.g. "10w", "100W", "22W"
        w_m = re.search(r'(\d+(?:\.\d+)?)\s*[Ww]\b', text)
        if w_m:
            self._add(attrs, "Wattage", w_m.group(1), "W")
        # Colour temperature  e.g. "50k", "3000K", "27k"
        cct_m = re.search(r'(\d+\.?\d*)\s*[Kk]\b', text)
        if cct_m:
            raw_k = cct_m.group(1)
            # "27k" → 2700K,  "3000" → 3000K
            val = float(raw_k)
            if val < 100:
                val = int(val * 1000)
            self._add(attrs, "Color Temperature", str(int(val)), "K")
        # Pack quantity
        if und.get("quantity"):
            self._add(attrs, "Pack Quantity", str(und["quantity"]))
        # Bulb type from product type
        pt = und.get("product_type", "") or ""
        if "led" in pt.lower():
            self._add(attrs, "Bulb Type", "LED")
        elif "fluorescent" in pt.lower():
            self._add(attrs, "Bulb Type", "Fluorescent")
        elif "hid" in pt.lower() or "sodium" in pt.lower():
            self._add(attrs, "Bulb Type", "HID")
        # Lamp size  e.g. T12, T9, MR16
        size_m = re.search(r'\b(T\d+|MR\d+|PAR\d+|A\d+|BR\d+)\b', text, re.IGNORECASE)
        if size_m:
            self._add(attrs, "Lamp Size", size_m.group(1).upper())
        return attrs

    # ── Ceiling fan ──────────────────────────────────────────────────────────
    def _extract_fan(self, text: str, und: dict) -> list[dict]:
        attrs = []
        span_m = re.search(r'(\d+)[\'"]\s*(?:fan|blade\s*span|diameter)?', text, re.IGNORECASE)
        if span_m:
            self._add(attrs, "Blade Span", span_m.group(1), "in")
        return attrs

    # ── Drill bit ────────────────────────────────────────────────────────────
    def _extract_drill_bit(self, text: str, und: dict) -> list[dict]:
        attrs = []
        # Diameter x length
        m = re.search(
            r'(\d+(?:[\/\-]\d+)?(?:\.\d+)?)\s*["\']?\s*[xX]\s*(\d+(?:[\/\-]\d+)?(?:\.\d+)?)\s*(["\']|in\b)?',
            text
        )
        if m:
            diam, length, _ = m.groups()
            self._add(attrs, "Diameter", diam, "in")
            self._add(attrs, "Length", length, "in")
        if und.get("quantity"):
            self._add(attrs, "Pack Quantity", str(und["quantity"]))
        return attrs

    # ── Router bit ───────────────────────────────────────────────────────────
    def _extract_router_bit(self, text: str, und: dict) -> list[dict]:
        attrs = []
        for dim in und.get("dimensions", []):
            self._add(attrs, "Dimension", dim)
            break
        return attrs

    # ── Decking / railing ────────────────────────────────────────────────────
    def _extract_decking(self, text: str, und: dict) -> list[dict]:
        attrs = []
        # Dimensions like 1x6-16'  or  6'x36"
        m = re.search(r'(\d+)\s*[nNxX]\s*(\d+)\s*[-]\s*(\d+)\s*[\'"]?', text)
        if m:
            thick, width, length = m.groups()
            self._add(attrs, "Thickness", thick, "in")
            self._add(attrs, "Width", width, "in")
            self._add(attrs, "Length", length, "ft")
        # Colour from description
        col_m = re.search(
            r'\b(Black|White|Gray|Grey|Brown|Tan|Mahogany|Walnut|Cedar|Coastal|Vintage)\b',
            text, re.IGNORECASE
        )
        if col_m:
            self._add(attrs, "Color", col_m.group(1).title())
        return attrs

    # ── Generic fallback ─────────────────────────────────────────────────────
    def _extract_generic(self, text: str, und: dict) -> list[dict]:
        attrs = []
        for dim in und.get("dimensions", []):
            self._add(attrs, "Dimension", dim)
            break
        if und.get("quantity"):
            self._add(attrs, "Pack Quantity", str(und["quantity"]))
        if und.get("grit"):
            self._add(attrs, "Grit", und["grit"])
        return attrs