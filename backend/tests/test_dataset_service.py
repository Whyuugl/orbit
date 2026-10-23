
import asyncio
from io import BytesIO
from pathlib import Path
from unittest.mock import patch

import pytest
from fastapi import HTTPException
from starlette.datastructures import UploadFile

from app.services import dataset_service


@pytest.fixture
def upload_dir(tmp_path: Path):
    """Use an isolated directory for uploaded test files."""
    with patch.object(dataset_service, "DATASETS_DIR", tmp_path):
        yield tmp_path


def make_upload(
    filename: str = "sample.csv",
    content: bytes = b"name,age\nAlice,20\nBob,21\n",
) -> UploadFile:
    """Build an in-memory upload."""
    return UploadFile(
        filename=filename,
        file=BytesIO(content),
    )


def test_upload_valid_csv_creates_metadata(
    upload_dir: Path,
) -> None:
    upload = make_upload()

    with patch.object(dataset_service, "create_dataset") as create_dataset:
        result = asyncio.run(dataset_service.upload_dataset(upload))

    assert result["original_filename"] == "sample.csv"
    assert result["row_count"] == 2
    assert result["column_count"] == 2
    assert result["columns"] == ["name", "age"]
    assert result["file_size_bytes"] == len(
        b"name,age\nAlice,20\nBob,21\n"
    )

    dataset_id = result["id"]
    stored_path = upload_dir / f"{dataset_id}.csv"

    assert stored_path.is_file()
    assert stored_path.read_bytes() == b"name,age\nAlice,20\nBob,21\n"

    create_dataset.assert_called_once()
    metadata = create_dataset.call_args.args[0]

    assert metadata["id"] == dataset_id
    assert metadata["stored_filename"] == f"{dataset_id}.csv"
    assert metadata["row_count"] == 2
    assert metadata["column_count"] == 2
    assert upload.file.closed


def test_upload_rejects_non_csv_file(
    upload_dir: Path,
) -> None:
    upload = make_upload(filename="sample.txt")

    with pytest.raises(HTTPException) as exc_info:
        asyncio.run(dataset_service.upload_dataset(upload))

    assert exc_info.value.status_code == 415
    assert list(upload_dir.iterdir()) == []
    assert upload.file.closed


def test_upload_rejects_empty_file(
    upload_dir: Path,
) -> None:
    upload = make_upload(content=b"")

    with pytest.raises(HTTPException) as exc_info:
        asyncio.run(dataset_service.upload_dataset(upload))

    assert exc_info.value.status_code == 422
    assert exc_info.value.detail == "The uploaded file is empty."
    assert list(upload_dir.iterdir()) == []
    assert upload.file.closed


def test_upload_rejects_invalid_csv_encoding(
    upload_dir: Path,
) -> None:
    upload = make_upload(content=b"\xff\xfe\xfa")

    with pytest.raises(HTTPException) as exc_info:
        asyncio.run(dataset_service.upload_dataset(upload))

    assert exc_info.value.status_code == 422
    assert "Invalid CSV" in exc_info.value.detail
    assert list(upload_dir.iterdir()) == []
    assert upload.file.closed


def test_upload_rejects_file_exceeding_size_limit(
    upload_dir: Path,
) -> None:
    upload = make_upload(content=b"name\nAlice\nBob\n")

    with patch.object(dataset_service, "MAX_UPLOAD_BYTES", 5):
        with pytest.raises(HTTPException) as exc_info:
            asyncio.run(dataset_service.upload_dataset(upload))

    assert exc_info.value.status_code == 413
    assert list(upload_dir.iterdir()) == []
    assert upload.file.closed


def test_upload_rejects_too_many_rows(
    upload_dir: Path,
) -> None:
    upload = make_upload(
        content=b"name\nAlice\nBob\nCharlie\n",
    )

    with patch.object(dataset_service, "MAX_ROWS", 2):
        with pytest.raises(HTTPException) as exc_info:
            asyncio.run(dataset_service.upload_dataset(upload))

    assert exc_info.value.status_code == 422
    assert "row limit" in exc_info.value.detail
    assert list(upload_dir.iterdir()) == []
    assert upload.file.closed


def test_upload_rejects_too_many_columns(
    upload_dir: Path,
) -> None:
    upload = make_upload(
        content=b"name,age,score\nAlice,20,90\n",
    )

    with patch.object(dataset_service, "MAX_COLUMNS", 2):
        with pytest.raises(HTTPException) as exc_info:
            asyncio.run(dataset_service.upload_dataset(upload))

    assert exc_info.value.status_code == 422
    assert "column limit" in exc_info.value.detail
    assert list(upload_dir.iterdir()) == []
    assert upload.file.closed


def test_upload_removes_file_if_metadata_creation_fails(
    upload_dir: Path,
) -> None:
    upload = make_upload()

    with patch.object(
        dataset_service,
        "create_dataset",
        side_effect=RuntimeError("Simulated database failure"),
    ):
        with pytest.raises(
            RuntimeError,
            match="Simulated database failure",
        ):
            asyncio.run(dataset_service.upload_dataset(upload))

    assert list(upload_dir.iterdir()) == []
    assert upload.file.closed
