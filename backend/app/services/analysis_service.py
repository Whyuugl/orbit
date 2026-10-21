
from pathlib import Path
from uuid import UUID

import numpy as np
import pandas as pd
from fastapi import HTTPException

from app.core.config import DATASETS_DIR, MAX_COLUMNS, MAX_ROWS
from app.repositories.dataset_repository import get_dataset_by_id


def _load_dataset(dataset_id: str) -> tuple[dict, pd.DataFrame]:
    try:
        normalized_id = str(UUID(dataset_id))
    except ValueError as exc:
        raise HTTPException(
            status_code=422,
            detail="Invalid dataset ID.",
        ) from exc

    metadata = get_dataset_by_id(normalized_id)

    if metadata is None:
        raise HTTPException(
            status_code=404,
            detail="Dataset not found.",
        )

    # Nama file berasal dari metadata internal, bukan dari request pengguna.
    expected_filename = f"{normalized_id}.csv"

    if metadata["stored_filename"] != expected_filename:
        raise HTTPException(
            status_code=500,
            detail="Dataset storage metadata is invalid.",
        )

    path = DATASETS_DIR / expected_filename

    if not path.is_file():
        raise HTTPException(
            status_code=410,
            detail="Dataset file is no longer available.",
        )

    try:
        dataframe = pd.read_csv(
            path,
            encoding="utf-8-sig",
            on_bad_lines="error",
        )
    except (OSError, UnicodeDecodeError, ValueError, pd.errors.ParserError) as exc:
        raise HTTPException(
            status_code=422,
            detail="Dataset could not be parsed.",
        ) from exc

    # Pemeriksaan pertahanan tambahan sebelum analisis.
    if len(dataframe) > MAX_ROWS or len(dataframe.columns) > MAX_COLUMNS:
        raise HTTPException(
            status_code=422,
            detail="Dataset exceeds the configured analysis limits.",
        )

    return metadata, dataframe


def _json_value(value):
    if value is None or pd.isna(value):
        return None

    if isinstance(value, np.generic):
        return value.item()

    if isinstance(value, (pd.Timestamp,)):
        return value.isoformat()

    return value


def get_dataset_preview(
    dataset_id: str,
    offset: int = 0,
    limit: int = 25,
) -> dict:
    metadata, dataframe = _load_dataset(dataset_id)

    if offset < 0:
        raise HTTPException(status_code=422, detail="Offset cannot be negative.")

    if limit < 1 or limit > 100:
        raise HTTPException(
            status_code=422,
            detail="Limit must be between 1 and 100.",
        )

    page = dataframe.iloc[offset:offset + limit]

    rows = [
        {
            str(column): _json_value(value)
            for column, value in row.items()
        }
        for row in page.to_dict(orient="records")
    ]

    return {
        "dataset_id": metadata["id"],
        "columns": metadata["columns"],
        "total_rows": len(dataframe),
        "offset": offset,
        "limit": limit,
        "rows": rows,
    }


def get_dataset_profile(dataset_id: str) -> dict:
    metadata, dataframe = _load_dataset(dataset_id)

    column_profiles = []

    for column in dataframe.columns:
        series = dataframe[column]
        profile = {
            "name": str(column),
            "dtype": str(series.dtype),
            "missing_count": int(series.isna().sum()),
            "missing_percent": round(
                float(series.isna().mean() * 100), 2
            ),
            "unique_count": int(series.nunique(dropna=True)),
        }

        if pd.api.types.is_numeric_dtype(series):
            numeric = pd.to_numeric(series, errors="coerce")
            profile["statistics"] = {
                "min": _json_value(numeric.min()),
                "max": _json_value(numeric.max()),
                "mean": _json_value(numeric.mean()),
                "median": _json_value(numeric.median()),
                "std": _json_value(numeric.std()),
            }
        else:
            profile["statistics"] = None

        column_profiles.append(profile)

    numeric_data = dataframe.select_dtypes(include="number")
    correlation = numeric_data.corr().round(4)

    correlation_matrix = {
        str(column): {
            str(index): _json_value(correlation.loc[index, column])
            for index in correlation.index
        }
        for column in correlation.columns
    }

    return {
        "dataset_id": metadata["id"],
        "row_count": len(dataframe),
        "column_count": len(dataframe.columns),
        "duplicate_rows": int(dataframe.duplicated().sum()),
        "columns": column_profiles,
        "correlation": correlation_matrix,
    }
