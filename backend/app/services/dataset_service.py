
import json
import logging
import uuid
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd
from fastapi import HTTPException, UploadFile
from pandas.errors import EmptyDataError, ParserError

from app.core.config import (
    DATASETS_DIR,
    MAX_COLUMNS,
    MAX_ROWS,
    MAX_UPLOAD_BYTES,
)
from app.repositories.dataset_repository import create_dataset

logger = logging.getLogger(__name__)

CHUNK_SIZE = 64 * 1024


def _validate_csv(path: Path) -> tuple[list[str], int, int]:
    try:
        # Baca header terlebih dahulu untuk memeriksa jumlah kolom.
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

        # Baca maksimal satu baris lebih banyak untuk mendeteksi
        # dataset yang melewati batas.
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
    except (EmptyDataError, ParserError, UnicodeDecodeError, ValueError) as exc:
        raise HTTPException(
            status_code=422,
            detail="Invalid CSV. Check its encoding, header, and row format.",
        ) from exc


async def upload_dataset(file: UploadFile) -> dict:
    original_filename = Path(file.filename or "").name

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

    DATASETS_DIR.mkdir(parents=True, exist_ok=True)

    dataset_id = str(uuid.uuid4())
    stored_filename = f"{dataset_id}.csv"
    final_path = DATASETS_DIR / stored_filename
    temp_path = DATASETS_DIR / f".{dataset_id}.part"

    total_bytes = 0

    try:
        # Baca bertahap agar ukuran upload dibatasi saat diterima,
        # bukan setelah seluruh file dimuat ke memori.
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

        # Jangan menggunakan nama file pengguna sebagai nama file di disk.
        temp_path.replace(final_path)

        created_at = datetime.now(timezone.utc).isoformat()

        metadata = {
            "id": dataset_id,
            "original_filename": original_filename[:255],
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
            # Jika pencatatan metadata gagal, hapus file agar tidak
            # meninggalkan dataset yang tidak terdaftar.
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
        temp_path.unlink(missing_ok=True)
        await file.close()
