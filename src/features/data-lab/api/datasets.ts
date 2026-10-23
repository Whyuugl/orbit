
import type {
  Dataset,
  DatasetPreview,
  DatasetProfile,
} from "../types/dataset";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000/api/v1";

async function request<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, init);
  } catch {
    throw new Error(
      "Tidak dapat terhubung ke Data Lab API. Pastikan backend berjalan.",
    );
  }

  if (!response.ok) {
    let message = `Request gagal (${response.status}).`;

    try {
      const body: { detail?: unknown } = await response.json();

      if (typeof body.detail === "string") {
        message = body.detail;
      }
    } catch {
      // Gunakan pesan default jika respons bukan JSON yang valid.
    }

    throw new Error(message);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export function listDatasets(): Promise<Dataset[]> {
  return request<Dataset[]>("/datasets");
}

export function uploadDataset(file: File): Promise<Dataset> {
  const formData = new FormData();
  formData.append("file", file);

  return request<Dataset>("/datasets", {
    method: "POST",
    body: formData,
  });
}

export function getDatasetPreview(
  datasetId: string,
  offset = 0,
  limit = 25,
): Promise<DatasetPreview> {
  const params = new URLSearchParams({
    offset: String(offset),
    limit: String(limit),
  });

  return request<DatasetPreview>(
    `/datasets/${encodeURIComponent(datasetId)}/preview?${params}`,
  );
}

export function getDatasetProfile(
  datasetId: string,
): Promise<DatasetProfile> {
  return request<DatasetProfile>(
    `/datasets/${encodeURIComponent(datasetId)}/profile`,
  );
}

export function deleteDataset(datasetId: string): Promise<void> {
  return request<void>(`/datasets/${encodeURIComponent(datasetId)}`, {
    method: "DELETE",
  });
}
