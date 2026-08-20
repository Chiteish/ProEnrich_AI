from pathlib import Path
import pandas as pd


class TaxonomyService:

    def __init__(self, taxonomy_file: Path):

        self.taxonomy_file = taxonomy_file

        if taxonomy_file.exists():
            self.df = pd.read_csv(
                taxonomy_file
            )
        else:
            self.df = pd.DataFrame()

    def get_taxonomy(self):

        if self.df.empty:
            return []

        return self.df.to_dict(
            orient="records"
        )

    def get_required_attributes(
        self,
        product_class: str | None
    ):

        # Day-3 baseline.
        # Replace this with the company's
        # actual attribute master when available.

        if not product_class:
            return []

        return []
    
class AttributeRequirementService:

    def __init__(self):

        self.requirements = {}

    def set_requirements(
        self,
        requirements: dict
    ):

        self.requirements = requirements

    def find_missing(
        self,
        product_class: str | None,
        extracted_attributes: list[dict]
    ):

        if not product_class:
            return []

        required = self.requirements.get(
            product_class,
            []
        )

        existing = {
            attribute["label"].lower()
            for attribute in extracted_attributes
        }

        return [
            attribute
            for attribute in required
            if attribute.lower()
            not in existing
        ]