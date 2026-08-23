import re


# ─── Brand signals embedded in Part_Desc ────────────────────────────────────
_BRAND_PATTERNS = [
    ("Diablo",          r"\bDiablo\b"),
    ("Milwaukee",       r"\bMilw(?:aukee)?\b"),
    ("Kichler",         r"\bKichler\b"),
    ("DeWalt",          r"\bDe\s?walt\b|\bDW\b(?=\d)"),
    ("Makita",          r"\bMakita\b"),
    ("Festool",         r"\bFestool\b"),
    ("3M",              r"\b3M\b"),
    ("Mirka",           r"\bMirka\b|\bHIOLIT\b|\bAbranet\b|\bCubitron\b"),
    ("Frigidaire",      r"\bFrigidaire\b|\bFRIG\b"),
    ("Whirlpool",       r"\bWhirlpool\b"),
    ("LG",              r"\bLG\b(?!\w)"),
    ("GE",              r"\bGE\b(?!\w)"),
    ("Speed Queen",     r"\bSpeed\s+Queen\b|\bSQ\b(?=\s+(Elect|Gas|Washer|Dryer))"),
    ("Satco",           r"\bSatco\b"),
    ("Philips",         r"\bPhilips\b"),
    ("Kreg",            r"\bKreg\b"),
    ("Leviton",         r"\bLeviton\b"),
    ("Hunter",          r"\bHunter\b"),
    ("Bosch",           r"\bBosch\b"),
    ("Irwin",           r"\bIrwin\b"),
    ("Senco",           r"\bSenco\b"),
    ("CMT",             r"\bCMT\b"),
    ("Southwire",       r"\bSouthwire\b"),
    ("Streamlight",     r"\bStreamlight\b"),
    ("Azek",            r"\bAzek\b"),
    ("Trex",            r"\bTrex\b"),
    ("SawStop",         r"\bSaw\s*Stop\b"),
    ("First Alert",     r"\bFirst\s+Alert\b"),
    ("Feit",            r"\bFeit\b"),
    ("Lithonia",        r"\bLithonia\b"),
]

# ─── Product-type keyword groups ─────────────────────────────────────────────
_TYPE_KEYWORDS: list[tuple[str, list[str]]] = [
    # Abrasives ----------------------------------------------------------------
    ("sanding belt",    ["sanding belt", "sand belt"]),
    ("sanding disc",    ["sanding disc", "sanding disk", "stikit film", "hiolit", "abranet",
                         "hook & loop disc", "hook and loop disc"]),
    ("cut-off disc",    ["cut-off disc", "cut off disc", "cutoff disc",
                         "cut-off wheel", "cut off wheel"]),
    ("grinding wheel",  ["grinding wheel", "masonry grinding"]),
    # Building Materials --------------------------------------------------------
    ("fascia board",    ["fascia"]),
    ("decking",         ["decking", " deck ", "trex", "azek", "lineage", "enhance", "1x6-", "1x8-", "1x12-"]),
    ("railing",         ["rail ", "railing", "baluster"]),
    ("mortar",          ["mortar", "concrete", "cement", "grout"]),
    ("drywall",         ["drywall", "gypsum", "sheetrock"]),
    ("door",            ["door "]),
    ("skylight",        ["skylight", "velux"]),
    # Lighting -----------------------------------------------------------------
    ("led bulb",        ["led ", " led", "led bulb", "led lamp", " led ", "led mr", "led med",
                         "led multi", "led 6\"", "led 10w", "led 22w", "led 32w", "led 50w",
                         "led 60w", "led 100w"]),
    ("fluorescent bulb",["flor ", "fluorescent", " t12 ", " t8 ", " t9 ", "fluor"]),
    ("hid lamp",        ["sodium", "metal halide", "hid lamp", " hid "]),
    ("strip light",     ["strip light", "striplight"]),
    ("ceiling fixture", ["ceiling fixture", "ceiling light", "flush mount", "semi-flush"]),
    ("recessed light",  ["retro fit", "retrofit", "recessed", "downlight"]),
    ("ceiling fan",     ["ceiling fan", "fan "]),
    # Appliances ---------------------------------------------------------------
    ("dishwasher",      ["dishwasher"]),
    ("electric dryer",  ["elect dryer", "electric dryer", "elec dryer", "sq elect"]),
    ("gas dryer",       ["gas dryer", "sq gas"]),
    ("washer",          ["washer "]),
    ("laundry center",  ["laundry center"]),
    # Power tools --------------------------------------------------------------
    ("drill bit",       ["drill bit", " drill ", "step drill", "auger bit",
                         "spade bit", "hole saw"]),
    ("saw blade",       ["saw blade", "circular saw", "miter saw"]),
    ("table saw",       ["table saw"]),
    ("band saw",        ["band saw", "bandsaw"]),
    ("router bit",      ["router bit", " router "]),
    ("nail gun",        ["nailer", "nail gun", "stapler"]),
    ("random orbital sander", ["orbital sander", "random orbital"]),
    # Hand tools ---------------------------------------------------------------
    ("screwdriver",     ["screwdriver", "driver bit set"]),
    ("measuring tape",  ["tape measure", "measuring tape", "steel tape"]),
    ("clamp",           ["pocket-hole", "pocket hole", "jig", "clamp"]),
    # Wire & cable -------------------------------------------------------------
    ("electrical wire", ["wire ", "cable ", "elect tape", "electrical tape", "romex",
                         "nm wire", "thhn"]),
    # Safety & Workwear --------------------------------------------------------
    ("kneeling pad",    ["kneeling pad", "knee pad"]),
    ("pressure gauge",  ["pressure", "inflator", "gauge"]),
    ("safety glasses",  ["safety glass", "safety glasses", "safety goggle", "safety spectacle"]),
    ("flashlight",      ["flashlight", "torch", "spotlight"]),
    ("smoke detector",  ["smoke detector", "smoke alarm", "fire alarm"]),
]


class ProductUnderstanding:

    def analyze(self, text: str, part_manuf: str = ""):
        text_lower = text.lower()

        product_type = self._product_type(text_lower)
        dimensions = self._dimensions(text_lower)
        quantity = self._quantity(text_lower)
        grit = self._grit(text_lower)
        brand = self._extract_brand(text, part_manuf)
        keywords = self._keywords(text_lower, product_type, brand)

        return {
            "product_type": product_type,
            "dimensions": dimensions,
            "quantity": quantity,
            "grit": grit,
            "brand": brand,
            "keywords": keywords,
        }

    # ── Product-type classification ──────────────────────────────────────────
    def _product_type(self, text: str) -> str | None:
        for ptype, signals in _TYPE_KEYWORDS:
            for signal in signals:
                if signal in text:
                    return ptype
        return None

    # ── Dimension extraction ─────────────────────────────────────────────────
    def _dimensions(self, text: str) -> list[str]:
        pattern = (
            r"\b\d+(?:[\/\-]\d+)?(?:\.\d+)?"
            r"\s*[\"']?\s*[xX×]\s*"
            r"\d+(?:[\/\-]\d+)?(?:\.\d+)?"
            r"(?:\s*(?:mm|cm|in|inch|inches))?\b"
        )
        return re.findall(pattern, text, re.IGNORECASE)

    # ── Pack quantity ─────────────────────────────────────────────────────────
    def _quantity(self, text: str) -> int | None:
        patterns = [
            r"\b(\d+)\s*pc\b",
            r"\b(\d+)\s*pcs\b",
            r"\b(\d+)\s*pieces\b",
            r"\bpack\s*of\s*(\d+)\b",
            r"\b(\d+)\s*disc/box\b",
            r"\b(\d+)\s*pk\b",
        ]
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return int(match.group(1))
        return None

    # ── Grit extraction ───────────────────────────────────────────────────────
    def _grit(self, text: str) -> str | None:
        patterns = [
            r"\b(\d+)\s*[-]?\s*grit\b",
            r"\bgrit\s*[:\-]?\s*(\d+)\b",
            r"\bP\s*(\d+)\b",           # e.g. P150, P80
        ]
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1)
        return None

    # ── Brand extraction ─────────────────────────────────────────────────────
    def _extract_brand(self, text: str, part_manuf: str = "") -> str | None:
        """Extract brand from Part_Desc text using signal patterns."""
        for brand, pat in _BRAND_PATTERNS:
            if re.search(pat, text, re.IGNORECASE):
                return brand
        return None

    # ── Keywords ──────────────────────────────────────────────────────────────
    def _keywords(
        self,
        text: str,
        product_type: str | None,
        brand: str | None
    ) -> list[str]:
        keywords = []
        if brand:
            keywords.append(brand.lower())
        if product_type:
            keywords.extend(product_type.split())
        # Colour/material signals
        for kw in ["stainless steel", "black", "white", "chrome", "aluminum", "aluminium"]:
            if kw in text:
                keywords.append(kw)
        return list(dict.fromkeys(keywords))  # deduplicate, preserve order