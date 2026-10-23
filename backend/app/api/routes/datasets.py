from fastapi import APIRouter, File, Query, UploadFile

from app.repositories.dataset_repository import (
    delete_dataset_by_id,
    get_dataset_by_id,
    list_datasets,
)
from app.schemas.dataset import DatasetResponse
from app.services.analysis_service import (
    get_dataset_preview,
    get_dataset_profile,
)
from app.services.dataset_service import delete_dataset, upload_dataset


router = APIRouter(prefix="/datasets", tags=["Datasets"])


@router.post(
    "",
    response_model=DatasetResponse,
    status_code=201,
)
async def create_dataset_endpoint(
    file: UploadFile = File(...),
) -> dict:
    return await upload_dataset(file)


@router.get("", response_model=list[DatasetResponse])
def list_datasets_endpoint() -> list[dict]:
    return list_datasets()


@router.delete("/{dataset_id}", status_code=204)
def delete_dataset_endpoint(dataset_id: str) -> None:
    delete_dataset(dataset_id)


@router.get("/{dataset_id}/preview")
def preview_dataset_endpoint(
    dataset_id: str,
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=25, ge=1, le=100),
) -> dict:
    return get_dataset_preview(
        dataset_id=dataset_id,
        offset=offset,
        limit=limit,
    )


@router.get("/{dataset_id}/profile")
def profile_dataset_endpoint(dataset_id: str) -> dict:
    return get_dataset_profile(dataset_id)
