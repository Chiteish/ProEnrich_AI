import os
import pandas as pd


class MissingAttributeService:

    def __init__(
        self,
        path="data/attribute_requirements.csv"
    ):

        self.path = path

        if os.path.exists(path):

            try:
                self.requirements = pd.read_csv(path)
            except pd.errors.EmptyDataError:

                self.requirements = pd.DataFrame()

        else:

            self.requirements = pd.DataFrame()

    def get_required_attributes(
        self,
        department=None,
        class_name=None,
        fine=None,
        product_type=None
    ):

        df = self.requirements

        if df.empty:
            return []

        if department and "department" in df.columns:

            df = df[
                df["department"] == department
            ]

        if class_name and "class_name" in df.columns:

            df = df[
                df["class_name"] == class_name
            ]

        if fine and "fine" in df.columns:

            df = df[
                df["fine"] == fine
            ]

        if (
            product_type
            and "product_type" in df.columns
        ):

            df = df[
                df["product_type"]
                .fillna("")
                .str.lower()
                == product_type.lower()
            ]

        if "required" in df.columns:

            df = df[
                df["required"]
                .astype(str)
                .str.lower()
                == "true"
            ]

        if "attribute_name" not in df.columns:
            return []

        return df[
            "attribute_name"
        ].tolist()

    def find_missing(
        self,
        *args,
        **kwargs
    ):

        # Old/test interface:
        # find_missing(product_type, attributes)
        if len(args) == 2:

            product_type = args[0]
            attributes = args[1]

            required = self.get_required_attributes(
                product_type=product_type
            )

        # New interface:
        # find_missing(attributes, department,
        #              class_name, fine)
        elif len(args) == 4:

            attributes = args[0]
            department = args[1]
            class_name = args[2]
            fine = args[3]

            required = self.get_required_attributes(
                department=department,
                class_name=class_name,
                fine=fine
            )

        else:

            raise TypeError(
                "find_missing expects either "
                "(product_type, attributes) or "
                "(attributes, department, "
                "class_name, fine)"
            )

        existing = {
            attribute["label"]
            for attribute in attributes
        }

        return [
            attribute
            for attribute in required
            if attribute not in existing
        ]