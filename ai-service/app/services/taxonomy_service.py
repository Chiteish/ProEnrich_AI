import os
import pandas as pd


class TaxonomyService:

    REQUIRED_COLUMNS = {
        "department",
        "class_name",
        "fine",
        "classpath"
    }

    def __init__(self, path):

        self.path = path
        self.taxonomy = None

    def load(self):

        if not os.path.exists(self.path):
            return None

        df = pd.read_csv(self.path)

        if not self.REQUIRED_COLUMNS.issubset(
            set(df.columns)
        ):
            raise ValueError(
                "Invalid taxonomy columns"
            )

        self.taxonomy = df

        return df

    def find_match(self, product_type: str = "", description: str = ""):

        if self.taxonomy is None:
            self.load()

        if self.taxonomy is None or self.taxonomy.empty:
            return None

        search_str = (product_type or "").lower().strip()
        desc_str = (description or "").lower().strip()

        if not search_str and not desc_str:
            return None

        # 1. Match fine column containing product_type
        if search_str:
            matches = self.taxonomy[
                self.taxonomy["fine"]
                .fillna("")
                .str.lower()
                .str.contains(search_str, regex=False)
            ]
            if not matches.empty:
                row = matches.iloc[0]
                return {
                    "department": row["department"],
                    "class_name": row["class_name"],
                    "fine": row["fine"],
                    "classpath": row["classpath"],
                    "confidence": 0.90,
                    "method": "fine_exact_contains"
                }

            # 2. Match class_name column containing product_type
            matches_class = self.taxonomy[
                self.taxonomy["class_name"]
                .fillna("")
                .str.lower()
                .str.contains(search_str, regex=False)
            ]
            if not matches_class.empty:
                row = matches_class.iloc[0]
                return {
                    "department": row["department"],
                    "class_name": row["class_name"],
                    "fine": row["fine"],
                    "classpath": row["classpath"],
                    "confidence": 0.85,
                    "method": "class_contains"
                }

        # 3. Search text (product_type + description) against fine / class_name / classpath keywords
        full_text = f"{search_str} {desc_str}"
        best_row = None
        best_score = 0

        for _, row in self.taxonomy.iterrows():
            fine_val = str(row["fine"]).lower()
            class_val = str(row["class_name"]).lower()
            classpath_val = str(row["classpath"]).lower()

            score = 0
            for token in full_text.split():
                if len(token) > 2:
                    if token in fine_val:
                        score += 3
                    if token in class_val:
                        score += 2
                    if token in classpath_val:
                        score += 1

            if score > best_score:
                best_score = score
                best_row = row

        if best_row is not None and best_score >= 2:
            return {
                "department": best_row["department"],
                "class_name": best_row["class_name"],
                "fine": best_row["fine"],
                "classpath": best_row["classpath"],
                "confidence": min(0.50 + (best_score * 0.05), 0.80),
                "method": "keyword_overlap"
            }

        return None