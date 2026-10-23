
import json
import logging
import uuid
from datetime import datetime, timezone
from pathlib import Path
from uuid import UUID

import pandas as pd
from fastapi import HTTPException, UploadFile
from pandas.errors import EmptyDataError, ParserError

from app.core.config import (
    DATASETS_DIR,
    MAX_COLUMNS,
    MAX_ROWS,
    MAX_UPLOAD_BYTES,
)
from app.repositories.dataset_repository import (
    create_dataset,
    delete_dataset_by_id,
    get_dataset_by_id,
)

logger = logging.getLogger(__name__)

CHUNK_SIZE = 64 * 1024
MAX_FILENAME_LENGTH = 255


def _validate_csv(path: Path) -> tuple[list[str], int, int]:
    """Validate a CSV file and enforce configured dataset limits."""
    try:
        header = pd.read_csv(
            path,
            encoding="utf-8-sig",
            nrows=0,
            on_bad_lines="error",
        )
        columns = [str(column) for column in header.columns]

        if not columns:
            raise HTTPException(
                status_code=422,
                detail="CSV must contain at least one column.",
            )

        if len(columns) > MAX_COLUMNS:
            raise HTTPException(
                status_code=422,
                detail=f"CSV exceeds the {MAX_COLUMNS}-column limit.",
            )

        preview = pd.read_csv(
            path,
            encoding="utf-8-sig",
            nrows=MAX_ROWS + 1,
            on_bad_lines="error",
        )

        if len(preview) > MAX_ROWS:
            raise HTTPException(
                status_code=422,
                detail=f"CSV exceeds the {MAX_ROWS}-row limit.",
            )

        return columns, len(preview), len(columns)

    except HTTPException:
        raise
    except (
        EmptyDataError,
        ParserError,
        UnicodeDecodeError,
        ValueError,
    ) as exc:
        raise HTTPException(
            status_code=422,
            detail="Invalid CSV. Check its encoding, header, and row format.",
        ) from exc


async def upload_dataset(file: UploadFile) -> dict:
    """Store a validated CSV and register its metadata."""
    temp_path: Path | None = None
    final_path: Path | None = None

    try:
        original_filename = Path(file.filename or "").name.strip()

        if not original_filename:
            raise HTTPException(
                status_code=400,
                detail="A filename is required.",
            )

        if Path(original_filename).suffix.lower() != ".csv":
            raise HTTPException(
                status_code=415,
                detail="Only CSV files are supported.",
            )

        original_filename = original_filename[:MAX_FILENAME_LENGTH]

        DATASETS_DIR.mkdir(parents=True, exist_ok=True)

        dataset_id = str(uuid.uuid4())
        stored_filename = f"{dataset_id}.csv"

        final_path = DATASETS_DIR / stored_filename
        temp_path = DATASETS_DIR / f".{dataset_id}.part"

        total_bytes = 0

        # Read incrementally to enforce the upload limit without
        # loading the entire uploaded file into memory.
        with temp_path.open("xb") as destination:
            while True:
                chunk = await file.read(CHUNK_SIZE)

                if not chunk:
                    break

                total_bytes += len(chunk)

                if total_bytes > MAX_UPLOAD_BYTES:
                    raise HTTPException(
                        status_code=413,
                        detail="CSV exceeds the upload size limit.",
                    )

                destination.write(chunk)

        if total_bytes == 0:
            raise HTTPException(
                status_code=422,
                detail="The uploaded file is empty.",
            )

        columns, row_count, column_count = _validate_csv(temp_path)

        # Never use a user-provided filename as the storage filename.
        temp_path.replace(final_path)

        created_at = datetime.now(timezone.utc).isoformat()

        metadata = {
            "id": dataset_id,
            "original_filename": original_filename,
            "stored_filename": stored_filename,
            "file_size_bytes": total_bytes,
            "row_count": row_count,
            "column_count": column_count,
            "columns_json": json.dumps(columns),
            "created_at": created_at,
        }

        try:
            create_dataset(metadata)
        except Exception:
            # Roll back the stored file if metadata registration fails.
            final_path.unlink(missing_ok=True)
            raise

        return {
            "id": dataset_id,
            "original_filename": metadata["original_filename"],
            "file_size_bytes": total_bytes,
            "row_count": row_count,
            "column_count": column_count,
            "columns": columns,
            "created_at": created_at,
        }

    except HTTPException:
        raise
    except OSError:
        logger.exception("Dataset storage operation failed")
        raise HTTPException(
            status_code=500,
            detail="Dataset could not be stored.",
        ) from None
    finally:
        if temp_path is not None:
            temp_path.unlink(missing_ok=True)

        await file.close()


def delete_dataset(dataset_id: str) -> None:
    """Delete a dataset's file and metadata. Validates UUID first."""
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

    # Remove file first, then metadata.
    file_path = DATASETS_DIR / f"{normalized_id}.csv"
    file_path.unlink(missing_ok=True)

    delete_dataset_by_id(normalized_id)
