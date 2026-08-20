import pandas as pd

from app.services.entity_resolution import EntityResolver
from app.utils.text_normalizer import is_empty_value


class ProductService:

    def __init__(
        self,
        manufacturer_file: str = "data/manufacturers.csv",
        brand_file: str = "data/brands.csv"
    ):
        self.manufacturers = self._load_values(
            manufacturer_file
        )

        self.brands = self._load_values(
            brand_file
        )

        self.manufacturer_resolver = EntityResolver(
            self.manufacturers
        )

        self.brand_resolver = EntityResolver(
            self.brands
        )

    def _load_values(self, path: str) -> list[str]:

        try:
            df = pd.read_csv(path)

            # Assume first column contains canonical values
            column = df.columns[0]

            return (
                df[column]
                .dropna()
                .astype(str)
                .tolist()
            )

        except FileNotFoundError:
            return []

    def resolve_manufacturer(self, value):

        if is_empty_value(value):
            return None

        return self.manufacturer_resolver.resolve(value)

    def resolve_brand(self, value):

        if is_empty_value(value):
            return None

        return self.brand_resolver.resolve(value)