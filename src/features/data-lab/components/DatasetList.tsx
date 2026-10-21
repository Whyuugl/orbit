
import { Database, FileSpreadsheet } from "lucide-react";
import type { Dataset } from "../types/dataset";

interface DatasetListProps {
  datasets: Dataset[];
  selectedId: string | null;
  onSelect: (dataset: Dataset) => void;
  isLoading: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DatasetList({
  datasets,
  selectedId,
  onSelect,
  isLoading,
}: DatasetListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-6 text-xs text-muted">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        Memuat dataset...
      </div>
    );
  }

  if (datasets.length === 0) {
    return (
      <div className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-white/[0.015] px-5 text-center">
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-surface-raised text-accent">
          <Database size={20} />
        </div>
        <p className="mb-1 text-sm font-medium text-slate-200">
          Belum ada dataset
        </p>
        <p className="max-w-xs text-xs leading-relaxed text-muted">
          Upload file CSV untuk mulai mengeksplorasi dan menganalisis data.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {datasets.map((dataset) => {
        const isSelected = selectedId === dataset.id;

        return (
          <button
            type="button"
            key={dataset.id}
            className={`group flex w-full min-w-0 items-center gap-3 rounded-xl border p-3 text-left transition ${
              isSelected
                ? "border-accent/30 bg-accent/[0.07]"
                : "border-border bg-surface hover:border-border-light hover:bg-surface-raised"
            }`}
            onClick={() => onSelect(dataset)}
            aria-pressed={isSelected}
          >
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${
                isSelected
                  ? "border-accent/20 bg-accent/10 text-accent"
                  : "border-border bg-surface-raised text-muted"
              }`}
            >
              <FileSpreadsheet size={18} />
            </span>

            <span className="flex min-w-0 flex-1 flex-col gap-1">
              <span
                className="truncate text-xs font-semibold text-slate-200"
                title={dataset.original_filename}
              >
                {dataset.original_filename}
              </span>
              <span className="text-[11px] text-muted">
                {dataset.row_count.toLocaleString("id-ID")} baris
                {" · "}
                {dataset.column_count} kolom
              </span>
            </span>

            <span className="shrink-0 text-[10px] tabular-nums text-subtle">
              {formatFileSize(dataset.file_size_bytes)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
