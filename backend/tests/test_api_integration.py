
from collections.abc import Iterator
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app.api.routes import datasets as datasets_routes
from app.main import app
from app.repositories import dataset_repository
from app.services import analysis_service, dataset_service


SAMPLE_CSV = (
    b"name,age,score\n"
    b"Alice,20,85\n"
    b"Bob,21,90\n"
    b"Charlie,22,88\n"
    b"Diana,23,95\n"
)


@pytest.fixture
def client(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> Iterator[TestClient]:
    """Run API requests against isolated SQLite and CSV storage."""
    datasets_dir = tmp_path / "datasets"
    database_path = tmp_path / "data_lab.sqlite3"

    monkeypatch.setattr(
        dataset_service,
        "DATASETS_DIR",
        datasets_dir,
    )
    monkeypatch.setattr(
        analysis_service,
        "DATASETS_DIR",
        datasets_dir,
    )
    monkeypatch.setattr(
        dataset_repository,
        "DATABASE_PATH",
        database_path,
    )

    with TestClient(app) as test_client:
        yield test_client


def upload_sample_csv(client: TestClient) -> dict:
    """Upload a real CSV through the public HTTP endpoint."""
    response = client.post(
        "/api/v1/datasets",
        files={
            "file": (
                "sample.csv",
                SAMPLE_CSV,
                "text/csv",
            )
        },
    )

    assert response.status_code == 201, response.text

    payload = response.json()
    assert payload["original_filename"] == "sample.csv"
    assert payload["row_count"] == 4
    assert payload["column_count"] == 3
    assert payload["columns"] == ["name", "age", "score"]

    return payload


def test_health_endpoint(client: TestClient) -> None:
    response = client.get("/api/v1/health")

    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "service": "orbit-data-lab",
    }


def test_upload_list_preview_and_profile_end_to_end(
    client: TestClient,
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Verify the main dataset workflow through HTTP."""
    datasets_dir = tmp_path / "datasets"
    monkeypatch.setattr(
        dataset_service,
        "DATASETS_DIR",
        datasets_dir,
    )
    monkeypatch.setattr(
        analysis_service,
        "DATASETS_DIR",
        datasets_dir,
    )

    uploaded = upload_sample_csv(client)
    dataset_id = uploaded["id"]

    # Verify that both the file and database metadata were persisted.
    stored_file = datasets_dir / f"{dataset_id}.csv"
    assert stored_file.is_file()
    assert stored_file.read_bytes() == SAMPLE_CSV

    # List endpoint must return the uploaded dataset.
    list_response = client.get("/api/v1/datasets")

    assert list_response.status_code == 200
    datasets = list_response.json()
    assert isinstance(datasets, list)

    listed = next(
        item for item in datasets
        if item["id"] == dataset_id
    )
    assert listed["original_filename"] == "sample.csv"
    assert listed["row_count"] == 4
    assert listed["column_count"] == 3
    assert listed["columns"] == ["name", "age", "score"]

    # Preview endpoint must return the requested page.
    preview_response = client.get(
        f"/api/v1/datasets/{dataset_id}/preview",
        params={"offset": 1, "limit": 2},
    )

    assert preview_response.status_code == 200
    preview = preview_response.json()

    assert preview["dataset_id"] == dataset_id
    assert preview["columns"] == ["name", "age", "score"]
    assert preview["total_rows"] == 4
    assert preview["offset"] == 1
    assert preview["limit"] == 2
    assert preview["rows"] == [
        {"name": "Bob", "age": 21, "score": 90},
        {"name": "Charlie", "age": 22, "score": 88},
    ]

    # Profile endpoint must return actual statistics.
    profile_response = client.get(
        f"/api/v1/datasets/{dataset_id}/profile"
    )

    assert profile_response.status_code == 200
    profile = profile_response.json()

    assert profile["dataset_id"] == dataset_id
    assert profile["row_count"] == 4
    assert profile["column_count"] == 3
    assert profile["duplicate_rows"] == 0

    profiles = {
        column["name"]: column
        for column in profile["columns"]
    }

    assert profiles["age"]["statistics"]["min"] == 20
    assert profiles["age"]["statistics"]["max"] == 23
    assert profiles["age"]["statistics"]["mean"] == 21.5

    assert "age" in profile["correlation"]
    assert "score" in profile["correlation"]["age"]


@pytest.mark.parametrize(
    ("filename", "content", "expected_status"),
    [
        ("notes.txt", b"hello", 415),
        ("empty.csv", b"", 422),
        ("invalid.csv", b"\xff\xfe\xfa", 422),
    ],
)
def test_upload_rejects_invalid_files(
    client: TestClient,
    filename: str,
    content: bytes,
    expected_status: int,
) -> None:
    response = client.post(
        "/api/v1/datasets",
        files={
            "file": (
                filename,
                content,
                "application/octet-stream",
            )
        },
    )

    assert response.status_code == expected_status


def test_upload_requires_file(client: TestClient) -> None:
    response = client.post("/api/v1/datasets")

    assert response.status_code == 422


@pytest.mark.parametrize(
    ("params", "expected_status"),
    [
        ({"offset": -1}, 422),
        ({"limit": 0}, 422),
        ({"limit": 101}, 422),
        ({"offset": "invalid"}, 422),
    ],
)
def test_preview_rejects_invalid_query_parameters(
    client: TestClient,
    params: dict[str, object],
    expected_status: int,
) -> None:
    uploaded = upload_sample_csv(client)

    response = client.get(
        f"/api/v1/datasets/{uploaded['id']}/preview",
        params=params,
    )

    assert response.status_code == expected_status


@pytest.mark.parametrize(
    ("endpoint", "dataset_id", "expected_status"),
    [
        ("preview", "invalid-id", 422),
        ("profile", "invalid-id", 422),
        (
            "preview",
            "c50e4b82-38d0-4b76-91f9-5baafe9e1827",
            404,
        ),
        (
            "profile",
            "c50e4b82-38d0-4b76-91f9-5baafe9e1827",
            404,
        ),
    ],
)
def test_dataset_endpoints_handle_invalid_or_missing_ids(
    client: TestClient,
    endpoint: str,
    dataset_id: str,
    expected_status: int,
) -> None:
    response = client.get(
        f"/api/v1/datasets/{dataset_id}/{endpoint}"
    )

    assert response.status_code == expected_status


def test_preview_returns_empty_rows_beyond_dataset(
    client: TestClient,
) -> None:
    uploaded = upload_sample_csv(client)

    response = client.get(
        f"/api/v1/datasets/{uploaded['id']}/preview",
        params={"offset": 100, "limit": 25},
    )

    assert response.status_code == 200
    assert response.json()["rows"] == []
