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

    def find_match(self, product_type):

        if self.taxonomy is None:
            self.load()

        if self.taxonomy is None:
            return None

        matches = self.taxonomy[
            self.taxonomy["fine"]
            .fillna("")
            .str.lower()
            .str.contains(
                product_type.lower(),
                regex=False
            )
        ]

        if matches.empty:
            return None

        row = matches.iloc[0]

        return {
            "department": row["department"],
            "class_name": row["class_name"],
            "fine": row["fine"],
            "classpath": row["classpath"],
            "confidence": 0.80,
            "method": "taxonomy_match"
        }