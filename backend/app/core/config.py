import os
from pathlib import Path


BACKEND_DIR = Path(__file__).resolve().parents[2]
DATA_DIR = BACKEND_DIR / "data"
DATASETS_DIR = DATA_DIR / "datasets"
DATABASE_PATH = DATA_DIR / "data_lab.sqlite3"


def _positive_int_env(name: str, default: int) -> int:
    raw_value = os.getenv(name, str(default))

    try:
        value = int(raw_value)
    except ValueError as exc:
        raise RuntimeError(
            f"{name} must be a positive integer"
        ) from exc

    if value <= 0:
        raise RuntimeError(f"{name} must be greater than zero")

    return value


MAX_UPLOAD_MB = _positive_int_env("DATA_LAB_MAX_UPLOAD_MB", 50)
MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024
MAX_ROWS = _positive_int_env("DATA_LAB_MAX_ROWS", 250_000)
MAX_COLUMNS = _positive_int_env("DATA_LAB_MAX_COLUMNS", 100)
