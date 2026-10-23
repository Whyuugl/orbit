
import json
import sqlite3
from typing import Any

from app.core.config import DATABASE_PATH


def _connect() -> sqlite3.Connection:
    DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)

    connection = sqlite3.connect(
        DATABASE_PATH,
        timeout=10,
    )
    connection.row_factory = sqlite3.Row
    return connection


def initialize_database() -> None:
    with _connect() as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS datasets (
                id TEXT PRIMARY KEY,
                original_filename TEXT NOT NULL,
                stored_filename TEXT NOT NULL UNIQUE,
                file_size_bytes INTEGER NOT NULL,
                row_count INTEGER NOT NULL,
                column_count INTEGER NOT NULL,
                columns_json TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
            """
        )


def create_dataset(metadata: dict[str, Any]) -> dict[str, Any]:
    initialize_database()

    with _connect() as connection:
        connection.execute(
            """
            INSERT INTO datasets (
                id,
                original_filename,
                stored_filename,
                file_size_bytes,
                row_count,
                column_count,
                columns_json,
                created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                metadata["id"],
                metadata["original_filename"],
                metadata["stored_filename"],
                metadata["file_size_bytes"],
                metadata["row_count"],
                metadata["column_count"],
                metadata["columns_json"],
                metadata["created_at"],
            ),
        )

    return metadata


def list_datasets() -> list[dict[str, Any]]:
    initialize_database()

    with _connect() as connection:
        rows = connection.execute(
            """
            SELECT
                id,
                original_filename,
                file_size_bytes,
                row_count,
                column_count,
                columns_json,
                created_at
            FROM datasets
            ORDER BY created_at DESC
            """
        ).fetchall()

    return [
        {
            "id": row["id"],
            "original_filename": row["original_filename"],
            "file_size_bytes": row["file_size_bytes"],
            "row_count": row["row_count"],
            "column_count": row["column_count"],
            "columns": json.loads(row["columns_json"]),
            "created_at": row["created_at"],
        }
        for row in rows
    ]


def get_dataset_by_id(dataset_id: str) -> dict[str, Any] | None:
    initialize_database()

    with _connect() as connection:
        row = connection.execute(
            """
            SELECT
                id,
                original_filename,
                stored_filename,
                file_size_bytes,
                row_count,
                column_count,
                columns_json,
                created_at
            FROM datasets
            WHERE id = ?
            """,
            (dataset_id,),
        ).fetchone()

    if row is None:
        return None

    return {
        "id": row["id"],
        "original_filename": row["original_filename"],
        "stored_filename": row["stored_filename"],
        "file_size_bytes": row["file_size_bytes"],
        "row_count": row["row_count"],
        "column_count": row["column_count"],
        "columns": json.loads(row["columns_json"]),
        "created_at": row["created_at"],
    }


def delete_dataset_by_id(dataset_id: str) -> None:
    """Delete a dataset record from the DB.

    Used by integrity cleanup to purge stale metadata.
    """
    initialize_database()
    with _connect() as connection:
        connection.execute(
            "DELETE FROM datasets WHERE id = ?",
            (dataset_id,),
        )
