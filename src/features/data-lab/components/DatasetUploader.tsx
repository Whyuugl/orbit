
import { useRef, useState } from "react";
import { FileUp, LoaderCircle } from "lucide-react";
import { uploadDataset } from "../api/datasets";
import type { Dataset } from "../types/dataset";

interface DatasetUploaderProps {
  onUploaded: (dataset: Dataset) => void;
}

export function DatasetUploader({ onUploaded }: DatasetUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const input = event.currentTarget;
    const file = input.files?.[0];

    if (!file) return;

    setError(null);

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError("Format file harus CSV.");
      input.value = "";
      return;
    }

    setIsUploading(true);

    try {
      const dataset = await uploadDataset(file);
      onUploaded(dataset);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Upload dataset gagal.",
      );
    } finally {
      setIsUploading(false);
      input.value = "";
    }
  }

  return (
    <div className="flex flex-col items-start gap-2 sm:items-end">
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="sr-only"
        onChange={handleFileChange}
        disabled={isUploading}
        aria-label="Pilih file CSV"
      />

      <button
        type="button"
        className="orbit-button orbit-button-primary disabled:cursor-not-allowed disabled:opacity-50"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
      >
        {isUploading ? (
          <LoaderCircle size={15} className="animate-spin" />
        ) : (
          <FileUp size={15} />
        )}
        {isUploading ? "Mengunggah..." : "Upload dataset"}
      </button>

      <p className="text-[11px] text-muted">
        CSV saja · Maksimal 10 MB
      </p>

      {error && (
        <p className="max-w-64 text-xs text-rose-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
