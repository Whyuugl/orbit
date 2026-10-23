import json
import logging
from pathlib import Path
from uuid import UUID

from app.core.config import DATASETS_DIR
from app.repositories.dataset_repository import (
    get_dataset_by_id,
    list_datasets,
    delete_dataset_by_id,
)

logger = logging.getLogger(__name__)


def _is_valid_uuid(value: str) -> bool:
    """Check if string is valid UUID4."""
    try:
        UUID(value)
        return True
    except (ValueError, TypeError, AttributeError):
        return False


def audit_metadata_integrity() -> dict:
    """Validate all dataset metadata records for consistency.
    
    Returns dict with 'valid', 'invalid', and 'details' keys.
    """
    datasets = list_datasets()
    valid = []
    invalid = []

    for dataset in datasets:
        issues = []
        dataset_id = dataset.get("id", "")

        if not _is_valid_uuid(dataset_id):
            issues.append("invalid_id_format")

        original = dataset.get("original_filename", "")
        if not original or len(original) > 255:
            issues.append("invalid_original_filename")

        # stored_filename must match {uuid}.csv
        expected_stored = f"{dataset_id}.csv"
        # We don't have stored_filename in list_datasets, check via get_dataset_by_id
        full_record = get_dataset_by_id(dataset_id)
        if full_record:
            stored = full_record.get("stored_filename", "")
            if stored != expected_stored:
                issues.append("stored_filename_mismatch")
        else:
            issues.append("metadata_not_retrievable")

        if issues:
            invalid.append({"id": dataset_id, "issues": issues})
        else:
            valid.append(dataset_id)

    return {
        "valid_count": len(valid),
        "invalid_count": len(invalid),
        "invalid": invalid,
    }


def find_orphan_files() -> list[str]:
    """Find CSV files in datasets dir with no matching metadata."""
    if not DATASETS_DIR.is_dir():
        return []

    orphans = []
    for path in DATASETS_DIR.glob("*.csv"):
        stem = path.stem
        if not _is_valid_uuid(stem):
            orphans.append(path.name)
            continue

        metadata = get_dataset_by_id(stem)
        if metadata is None:
            orphans.append(path.name)

    return orphans


def find_missing_files() -> list[dict]:
    """Find metadata records whose CSV file is missing."""
    datasets = list_datasets()
    missing = []

    for dataset in datasets:
        dataset_id = dataset.get("id", "")
        expected_path = DATASETS_DIR / f"{dataset_id}.csv"

        if not expected_path.is_file():
            missing.append({
                "id": dataset_id,
                "original_filename": dataset.get("original_filename", ""),
                "expected_path": str(expected_path),
            })

    return missing


def cleanup_orphan_files() -> list[str]:
    """Remove orphan CSV files (no metadata). Returns list of removed files."""
    orphans = find_orphan_files()
    removed = []

    for filename in orphans:
        path = DATASETS_DIR / filename
        try:
            path.unlink()
            removed.append(filename)
            logger.info("Removed orphan file: %s", filename)
        except OSError:
            logger.warning("Failed to remove orphan file: %s", filename)

    return removed


def cleanup_missing_file_metadata() -> list[str]:
    """Remove metadata records for missing CSV files. Returns list of removed IDs."""
    missing = find_missing_files()
    removed = []

    for record in missing:
        dataset_id = record["id"]
        try:
            delete_dataset_by_id(dataset_id)
            removed.append(dataset_id)
            logger.info("Removed stale metadata: %s", dataset_id)
        except Exception:
            logger.warning("Failed to remove stale metadata: %s", dataset_id)

    return removed


def full_integrity_audit() -> dict:
    """Run complete integrity check and return report."""
    return {
        "metadata": audit_metadata_integrity(),
        "orphan_files": find_orphan_files(),
        "missing_files": find_missing_files(),
    }


def cleanup_temp_files() -> list[str]:
    """Remove leftover .part temp files from interrupted uploads."""
    if not DATASETS_DIR.is_dir():
        return []

    removed = []
    for path in DATASETS_DIR.glob(".*.part"):
        try:
            path.unlink()
            removed.append(path.name)
            logger.info("Removed temp file: %s", path.name)
        except OSError:
            logger.warning("Failed to remove temp file: %s", path.name)

    return removed
