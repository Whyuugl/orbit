from app.core.config import MAX_COLUMNS, MAX_ROWS
from app.services.analysis_service import _validate_dataset_limits
from pathlib import Path
from unittest.mock import patch

import pandas as pd
import pytest
from fastapi import HTTPException

from app.services.analysis_service import get_dataset_profile
from app.services.analysis_service import (
    _validate_dataset_limits,
    get_dataset_preview,
    get_dataset_profile,
)


DATASET_ID = "c50e4b82-38d0-4b76-91f9-5baafe9e1827"

SAMPLE_METADATA = {
    "id": DATASET_ID,
    "stored_filename": f"{DATASET_ID}.csv",
    "row_count": 4,
    "column_count": 3,
    "columns": ["name", "age", "score"],
}

SAMPLE_CSV = (
    "name,age,score\n"
    "Alice,20,85\n"
    "Bob,21,90\n"
    "Charlie,22,88\n"
    "Diana,23,95\n"
)


@pytest.fixture
def dataset_file(tmp_path: Path) -> Path:
    path = tmp_path / f"{DATASET_ID}.csv"
    path.write_text(SAMPLE_CSV, encoding="utf-8")
    return path


@pytest.fixture
def mocked_dataset(dataset_file: Path):
    with (
        patch(
            "app.services.analysis_service.get_dataset_by_id",
            return_value=SAMPLE_METADATA.copy(),
        ),
        patch(
            "app.services.analysis_service.DATASETS_DIR",
            dataset_file.parent,
        ),
    ):
        yield dataset_file


def test_preview_first_page(mocked_dataset: Path) -> None:
    result = get_dataset_preview(DATASET_ID, offset=0, limit=2)

    assert result["dataset_id"] == DATASET_ID
    assert result["columns"] == ["name", "age", "score"]
    assert result["total_rows"] == 4
    assert result["offset"] == 0
    assert result["limit"] == 2
    assert len(result["rows"]) == 2
    assert result["rows"][0]["name"] == "Alice"
    assert result["rows"][1]["name"] == "Bob"


def test_preview_next_page(mocked_dataset: Path) -> None:
    result = get_dataset_preview(DATASET_ID, offset=2, limit=2)

    assert len(result["rows"]) == 2
    assert result["rows"][0]["name"] == "Charlie"
    assert result["rows"][1]["name"] == "Diana"


def test_preview_offset_beyond_dataset_returns_empty_rows(
    mocked_dataset: Path,
) -> None:
    result = get_dataset_preview(DATASET_ID, offset=10, limit=25)

    assert result["rows"] == []
    assert result["total_rows"] == 4
    assert result["offset"] == 10


@pytest.mark.parametrize(
    ("offset", "limit"),
    [
        (-1, 25),
        (0, 0),
        (0, 101),
    ],
)
def test_preview_rejects_invalid_pagination(
    offset: int,
    limit: int,
) -> None:
    with pytest.raises(HTTPException) as exc_info:
        get_dataset_preview(DATASET_ID, offset=offset, limit=limit)

    assert exc_info.value.status_code == 422


def test_preview_rejects_invalid_dataset_id() -> None:
    with pytest.raises(HTTPException) as exc_info:
        get_dataset_preview("invalid-id", offset=0, limit=25)

    assert exc_info.value.status_code == 422


def test_preview_returns_404_for_missing_dataset() -> None:
    with patch(
        "app.services.analysis_service.get_dataset_by_id",
        return_value=None,
    ):
        with pytest.raises(HTTPException) as exc_info:
            get_dataset_preview(DATASET_ID, offset=0, limit=25)

    assert exc_info.value.status_code == 404

def test_profile_returns_expected_statistics(
    mocked_dataset: Path,
) -> None:
    result = get_dataset_profile(DATASET_ID)

    assert result["dataset_id"] == DATASET_ID
    assert result["row_count"] == 4
    assert result["column_count"] == 3
    assert result["duplicate_rows"] == 0

    profiles = {
        column["name"]: column
        for column in result["columns"]
    }

    assert profiles["name"]["unique_count"] == 4
    assert profiles["age"]["missing_count"] == 0
    assert profiles["age"]["statistics"]["min"] == 20
    assert profiles["age"]["statistics"]["max"] == 23
    assert profiles["age"]["statistics"]["mean"] == 21.5
    assert profiles["age"]["statistics"]["median"] == 21.5

    assert "age" in result["correlation"]
    assert "score" in result["correlation"]["age"]


def test_profile_returns_404_for_missing_dataset() -> None:
    with patch(
        "app.services.analysis_service.get_dataset_by_id",
        return_value=None,
    ):
        with pytest.raises(HTTPException) as exc_info:
            get_dataset_profile(DATASET_ID)

    assert exc_info.value.status_code == 404


def test_profile_rejects_invalid_dataset_id() -> None:
    with pytest.raises(HTTPException) as exc_info:
        get_dataset_profile("invalid-id")

    assert exc_info.value.status_code == 422

def test_validate_dataset_limits_accepts_allowed_dataset() -> None:
    _validate_dataset_limits(row_count=100, column_count=10)


def test_validate_dataset_limits_rejects_too_many_rows() -> None:
    with pytest.raises(HTTPException) as exc_info:
        _validate_dataset_limits(
            row_count=MAX_ROWS + 1,
            column_count=10,
        )

    assert exc_info.value.status_code == 422


def test_validate_dataset_limits_rejects_too_many_columns() -> None:
    with pytest.raises(HTTPException) as exc_info:
        _validate_dataset_limits(
            row_count=100,
            column_count=MAX_COLUMNS + 1,
        )

    assert exc_info.value.status_code == 422