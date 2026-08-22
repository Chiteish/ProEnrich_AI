from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

DATA_DIR = BASE_DIR / "data"

MANUFACTURER_FILE = DATA_DIR / "manufacturers.csv"
BRAND_FILE = DATA_DIR / "brands.csv"

FUZZY_MATCH_THRESHOLD = 0.85