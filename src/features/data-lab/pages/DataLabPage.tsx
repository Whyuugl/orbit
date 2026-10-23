
import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Database,
  RefreshCw,
} from "lucide-react";
import {
  getDatasetPreview,
  getDatasetProfile,
  listDatasets,
  deleteDataset,
} from "../api/datasets";
import { DatasetList } from "../components/DatasetList";
import { DatasetUploader } from "../components/DatasetUploader";
import { StatCard } from "../components/StatCard";
import type {
  Dataset,
  DatasetPreview,
  DatasetProfile,
} from "../types/dataset";

export function DataLabPage() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selected, setSelected] = useState<Dataset | null>(null);
  const [preview, setPreview] = useState<DatasetPreview | null>(null);
  const [profile, setProfile] = useState<DatasetProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);

  const pageSize = 25;

  const refreshDatasets = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await listDatasets();
      setDatasets(result);

      setSelected((current) => {
        if (!current) return null;
        return result.find((item) => item.id === current.id) ?? null;
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal memuat dataset.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
  let cancelled = false;

  async function loadInitialDatasets() {
    try {
      const result = await listDatasets();

      if (!cancelled) {
        setDatasets(result);
      }
    } catch (err) {
      if (!cancelled) {
        setError(
          err instanceof Error
            ? err.message
            : "Gagal memuat dataset.",
        );
      }
    } finally {
      if (!cancelled) {
        setIsLoading(false);
      }
    }
  }

  void loadInitialDatasets();

  return () => {
    cancelled = true;
  };
}, []);

  const loadDataset = useCallback(
    async (dataset: Dataset, nextOffset = 0) => {
      setSelected(dataset);
      setOffset(nextOffset);
      setIsAnalyzing(true);
      setError(null);

      try {
        const [nextPreview, nextProfile] = await Promise.all([
          getDatasetPreview(dataset.id, nextOffset, pageSize),
          getDatasetProfile(dataset.id),
        ]);

        setPreview(nextPreview);
        setProfile(nextProfile);
      } catch (err) {
        setPreview(null);
        setProfile(null);
        setError(
          err instanceof Error ? err.message : "Analisis dataset gagal.",
        );
      } finally {
        setIsAnalyzing(false);
      }
    },
    [],
  );

  function handleUploaded(dataset: Dataset) {
    setDatasets((current) => [
      dataset,
      ...current.filter((item) => item.id !== dataset.id),
    ]);
    void loadDataset(dataset);
  }

  async function handleDelete(dataset: Dataset) {
    if (!window.confirm(`Hapus dataset "${dataset.original_filename}"?`)) {
      return;
    }

    setError(null);

    try {
      await deleteDataset(dataset.id);
      setDatasets((current) =>
        current.filter((item) => item.id !== dataset.id),
      );

      if (selected?.id === dataset.id) {
        setSelected(null);
        setPreview(null);
        setProfile(null);
        setOffset(0);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal menghapus dataset.",
      );
    }
  }

  function formatNumber(value: number | null | undefined): string {
    if (value == null || !Number.isFinite(value)) return "—";

    return value.toLocaleString("id-ID", {
      maximumFractionDigits: 2,
    });
  }

  return (
    <div className="space-y-7">
      <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div className="min-w-0">
          <div className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-accent">
            <Database size={13} />
            Workspace / Data tools
          </div>

          <h1 className="mb-2 font-display text-2xl font-semibold tracking-tight text-slate-100 sm:text-3xl">
            Data Lab
          </h1>

          <p className="max-w-2xl text-xs leading-relaxed text-muted sm:text-[13px]">
            Eksplorasi dataset, pahami kualitas data, dan temukan pola
            sebelum membangun model machine learning.
          </p>
        </div>

        <button
          type="button"
          className="orbit-button self-start sm:self-auto"
          onClick={() => void refreshDatasets()}
          disabled={isLoading}
        >
          <RefreshCw
            size={14}
            className={isLoading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </header>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-rose-400/20 bg-rose-400/[0.06] p-4 text-xs text-rose-300"
        >
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <p className="min-w-0 flex-1 leading-relaxed">{error}</p>
        </div>
      )}

      <section className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
        <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-base font-semibold text-slate-100">
                Dataset
              </h2>
              <span className="rounded-md border border-border bg-surface-raised px-2 py-0.5 text-[10px] tabular-nums text-muted">
                {datasets.length}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted">
              Pilih dataset untuk melihat preview dan statistiknya.
            </p>
          </div>

          <DatasetUploader onUploaded={handleUploaded} />
        </div>

        <DatasetList
          datasets={datasets}
          selectedId={selected?.id ?? null}
          onSelect={(dataset) => void loadDataset(dataset)}
          onDelete={(dataset) => void handleDelete(dataset)}
          isLoading={isLoading}
        />
      </section>

      {selected && (
        <>
          <section className="space-y-4">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
              <div className="min-w-0">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-accent">
                  Data overview
                </p>
                <h2 className="break-words font-display text-lg font-semibold text-slate-100">
                  {selected.original_filename}
                </h2>
                <p className="mt-1 text-xs text-muted">
                  Ringkasan struktur dan kualitas dataset.
                </p>
              </div>

              {isAnalyzing && (
                <span className="flex items-center gap-2 text-[11px] text-muted">
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                  Menganalisis data...
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Total baris"
                value={formatNumber(profile?.row_count)}
                description="Jumlah observasi"
              />
              <StatCard
                label="Total kolom"
                value={formatNumber(profile?.column_count)}
                description="Jumlah fitur"
              />
              <StatCard
                label="Baris duplikat"
                value={formatNumber(profile?.duplicate_rows)}
                description="Perlu diperiksa"
              />
              <StatCard
                label="Ukuran file"
                value={`${(selected.file_size_bytes / 1024).toFixed(1)} KB`}
                description="CSV yang diunggah"
              />
            </div>
          </section>

          <section className="min-w-0 rounded-2xl border border-border bg-surface p-4 sm:p-5">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Activity size={16} className="text-accent" />
                  <h2 className="font-display text-base font-semibold text-slate-100">
                    Data preview
                  </h2>
                </div>
                <p className="mt-1 text-xs text-muted">
                  Sampel baris yang tersimpan dalam dataset.
                </p>
              </div>
              <span className="shrink-0 rounded-md border border-border bg-surface-raised px-2 py-1 text-[10px] text-muted">
                CSV
              </span>
            </div>

            {isAnalyzing && !preview ? (
              <div className="flex min-h-32 items-center justify-center gap-2 text-xs text-muted">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                Memuat preview...
              </div>
            ) : preview && preview.columns.length > 0 ? (
              <>
                <div className="max-w-full overflow-auto rounded-xl border border-border">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead className="bg-surface-raised">
                      <tr>
                        <th className="sticky left-0 border-b border-border bg-surface-raised px-3 py-3 text-[10px] font-semibold text-muted">
                          #
                        </th>
                        {preview.columns.map((column) => (
                          <th
                            key={column}
                            className="whitespace-nowrap border-b border-border px-4 py-3 text-[10px] font-semibold text-muted"
                          >
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {preview.rows.map((row, rowIndex) => (
                        <tr
                          key={`${preview.offset}-${rowIndex}`}
                          className="transition-colors hover:bg-white/[0.025]"
                        >
                          <td className="sticky left-0 border-b border-border/70 bg-surface px-3 py-3 tabular-nums text-subtle">
                            {preview.offset + rowIndex + 1}
                          </td>
                          {preview.columns.map((column) => {
                            const value = row[column];

                            return (
                              <td
                                key={column}
                                className="max-w-64 truncate whitespace-nowrap border-b border-border/70 px-4 py-3 text-slate-300"
                                title={value == null ? "" : String(value)}
                              >
                                {value == null || value === ""
                                  ? <span className="text-subtle">—</span>
                                  : String(value)}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <p className="text-[11px] text-muted">
                    {preview.total_rows === 0
                      ? "Tidak ada baris"
                      : `${preview.offset + 1}–${Math.min(
                          preview.offset + preview.rows.length,
                          preview.total_rows,
                        )} dari ${preview.total_rows.toLocaleString("id-ID")} baris`}
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="orbit-button"
                      disabled={isAnalyzing || offset === 0}
                      onClick={() =>
                        void loadDataset(
                          selected,
                          Math.max(0, offset - pageSize),
                        )
                      }
                    >
                      <ArrowUp size={13} />
                      Sebelumnya
                    </button>
                    <button
                      type="button"
                      className="orbit-button"
                      disabled={
                        isAnalyzing ||
                        offset + pageSize >= preview.total_rows
                      }
                      onClick={() =>
                        void loadDataset(selected, offset + pageSize)
                      }
                    >
                      Berikutnya
                      <ArrowDown size={13} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <p className="py-8 text-center text-xs text-muted">
                Belum ada data preview yang bisa ditampilkan.
              </p>
            )}
          </section>

          {profile && (
            <section className="min-w-0 rounded-2xl border border-border bg-surface p-4 sm:p-5">
              <div className="mb-5">
                <h2 className="font-display text-base font-semibold text-slate-100">
                  Profil kolom
                </h2>
                <p className="mt-1 text-xs text-muted">
                  Statistik dasar untuk memahami isi setiap fitur.
                </p>
              </div>

              <div className="max-w-full overflow-auto rounded-xl border border-border">
                <table className="w-full border-collapse text-left text-xs">
                  <thead className="bg-surface-raised">
                    <tr>
                      {[
                        "Kolom",
                        "Tipe data",
                        "Nilai kosong",
                        "Nilai unik",
                        "Rata-rata",
                        "Minimum",
                        "Maksimum",
                      ].map((heading) => (
                        <th
                          key={heading}
                          className="whitespace-nowrap border-b border-border px-4 py-3 text-[10px] font-semibold text-muted"
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {profile.columns.map((column) => (
                      <tr
                        key={column.name}
                        className="transition-colors hover:bg-white/[0.025]"
                      >
                        <td className="border-b border-border/70 px-4 py-3 font-semibold text-slate-200">
                          {column.name}
                        </td>
                        <td className="border-b border-border/70 px-4 py-3 text-muted">
                          {column.dtype}
                        </td>
                        <td className="border-b border-border/70 px-4 py-3 tabular-nums text-slate-300">
                          {column.missing_count}
                          <span className="ml-1 text-muted">
                            ({formatNumber(column.missing_percent)}%)
                          </span>
                        </td>
                        <td className="border-b border-border/70 px-4 py-3 tabular-nums text-slate-300">
                          {column.unique_count}
                        </td>
                        <td className="border-b border-border/70 px-4 py-3 tabular-nums text-slate-300">
                          {formatNumber(column.statistics?.mean)}
                        </td>
                        <td className="border-b border-border/70 px-4 py-3 tabular-nums text-slate-300">
                          {formatNumber(column.statistics?.min)}
                        </td>
                        <td className="border-b border-border/70 px-4 py-3 tabular-nums text-slate-300">
                          {formatNumber(column.statistics?.max)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
