
from pathlib import Path
from uuid import UUID

import numpy as np
import pandas as pd
from fastapi import HTTPException

from app.core.config import DATASETS_DIR, MAX_COLUMNS, MAX_ROWS
from app.repositories.dataset_repository import get_dataset_by_id


PREVIEW_CHUNK_SIZE = 10_000


def _get_dataset_source(dataset_id: str) -> tuple[dict, Path]:
    """Validate a dataset ID and resolve its stored CSV path."""
    try:
        normalized_id = str(UUID(dataset_id))
    except (ValueError, TypeError, AttributeError) as exc:
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

    expected_filename = f"{normalized_id}.csv"

    if metadata.get("stored_filename") != expected_filename:
        raise HTTPException(
            status_code=500,
            detail="Dataset storage metadata is invalid.",
        )

    try:
        columns = metadata.get("columns")
        if not isinstance(columns, list) or not all(
            isinstance(column, str) for column in columns
        ):
            raise ValueError("invalid columns")
    except (TypeError, ValueError) as exc:
        raise HTTPException(
            status_code=500,
            detail="Dataset metadata is invalid.",
        ) from exc

    path = DATASETS_DIR / expected_filename

    if not path.is_file():
        raise HTTPException(
            status_code=410,
            detail="Dataset file is no longer available.",
        )

    return metadata, path


def _validate_dataset_limits(
    row_count: int,
    column_count: int,
) -> None:
    """Reject datasets that exceed configured analysis limits."""
    if row_count > MAX_ROWS or column_count > MAX_COLUMNS:
        raise HTTPException(
            status_code=422,
            detail="Dataset exceeds the configured analysis limits.",
        )


def _load_dataset(dataset_id: str) -> tuple[dict, pd.DataFrame]:
    """Load a complete dataset for profiling."""
    metadata, path = _get_dataset_source(dataset_id)

    try:
        dataframe = pd.read_csv(
            path,
            encoding="utf-8-sig",
            on_bad_lines="error",
        )
    except (
        OSError,
        UnicodeDecodeError,
        ValueError,
        pd.errors.ParserError,
        pd.errors.EmptyDataError,
    ) as exc:
        raise HTTPException(
            status_code=410,
            detail="Dataset file is corrupted or cannot be read.",
        ) from exc

    # Verify CSV shape matches metadata (changed file detection)
    actual_row_count = len(dataframe)
    actual_column_count = len(dataframe.columns)
    expected_row_count = metadata.get("row_count")
    expected_column_count = metadata.get("column_count")

    if (
        isinstance(expected_row_count, int)
        and actual_row_count != expected_row_count
    ):
        raise HTTPException(
            status_code=410,
            detail="Dataset file has been modified after upload.",
        )

    if (
        isinstance(expected_column_count, int)
        and actual_column_count != expected_column_count
    ):
        raise HTTPException(
            status_code=410,
            detail="Dataset file has been modified after upload.",
        )

    _validate_dataset_limits(actual_row_count, actual_column_count)

    return metadata, dataframe


def _json_value(value):
    """Convert pandas and NumPy values into JSON-compatible values."""
    if value is None:
        return None

    if isinstance(value, (float, np.floating)) and not np.isfinite(value):
        return None

    if isinstance(value, np.generic):
        value = value.item()

    if isinstance(value, pd.Timestamp):
        return value.isoformat()

    return value


def get_dataset_preview(
    dataset_id: str,
    offset: int = 0,
    limit: int = 25,
) -> dict:
    """Read only the CSV chunks required for the requested page."""
    if offset < 0:
        raise HTTPException(
            status_code=422,
            detail="Offset cannot be negative.",
        )

    if limit < 1 or limit > 100:
        raise HTTPException(
            status_code=422,
            detail="Limit must be between 1 and 100.",
        )

    metadata, path = _get_dataset_source(dataset_id)

    try:
        total_rows = int(metadata["row_count"])
        total_columns = int(metadata["column_count"])
        columns = metadata["columns"]
    except (KeyError, TypeError, ValueError) as exc:
        raise HTTPException(
            status_code=500,
            detail="Dataset metadata is invalid.",
        ) from exc

    _validate_dataset_limits(total_rows, total_columns)

    if offset >= total_rows:
        return {
            "dataset_id": metadata["id"],
            "columns": columns,
            "total_rows": total_rows,
            "offset": offset,
            "limit": limit,
            "rows": [],
        }

    rows = []
    rows_to_skip = offset

    try:
        chunks = pd.read_csv(
            path,
            encoding="utf-8-sig",
            on_bad_lines="error",
            chunksize=PREVIEW_CHUNK_SIZE,
        )

        for chunk in chunks:
            _validate_dataset_limits(
                row_count=total_rows,
                column_count=len(chunk.columns),
            )

            if rows_to_skip >= len(chunk):
                rows_to_skip -= len(chunk)
                continue

            start = rows_to_skip
            remaining = limit - len(rows)
            page = chunk.iloc[start:start + remaining]
            rows_to_skip = 0

            rows.extend(
                {
                    str(column): _json_value(value)
                    for column, value in row.items()
                }
                for row in page.to_dict(orient="records")
            )

            if len(rows) >= limit:
                break

    except HTTPException:
        raise
    except (
        OSError,
        UnicodeDecodeError,
        ValueError,
        pd.errors.ParserError,
        pd.errors.EmptyDataError,
    ) as exc:
        raise HTTPException(
            status_code=422,
            detail="Dataset could not be parsed.",
        ) from exc

    return {
        "dataset_id": metadata["id"],
        "columns": columns,
        "total_rows": total_rows,
        "offset": offset,
        "limit": limit,
        "rows": rows,
    }


def get_dataset_profile(dataset_id: str) -> dict:
    """Generate descriptive statistics for a dataset."""
    metadata, dataframe = _load_dataset(dataset_id)

    column_profiles = []

    for column in dataframe.columns:
        series = dataframe[column]

        profile = {
            "name": str(column),
            "dtype": str(series.dtype),
            "missing_count": int(series.isna().sum()),
            "missing_percent": round(
                float(series.isna().mean() * 100),
                2,
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
