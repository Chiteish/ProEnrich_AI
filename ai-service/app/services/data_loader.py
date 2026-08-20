from pathlib import Path
import pandas as pd


def load_single_column_csv(
    file_path: Path
) -> list[str]:

    if not file_path.exists():
        return []

    df = pd.read_csv(file_path)

    if df.empty:
        return []

    first_column = df.columns[0]

    values = (
        df[first_column]
        .dropna()
        .astype(str)
        .str.strip()
        .tolist()
    )

    return list(dict.fromkeys(values))