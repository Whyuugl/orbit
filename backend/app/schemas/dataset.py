from datetime import datetime

from pydantic import BaseModel, ConfigDict


class DatasetResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str
    original_filename: str
    file_size_bytes: int
    row_count: int
    column_count: int
    columns: list[str]
    created_at: datetime
