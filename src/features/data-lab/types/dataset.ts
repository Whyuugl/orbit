
export interface Dataset {
  id: string;
  original_filename: string;
  file_size_bytes: number;
  row_count: number;
  column_count: number;
  columns: string[];
  created_at: string;
}

export interface DatasetPreview {
  dataset_id: string;
  columns: string[];
  total_rows: number;
  offset: number;
  limit: number;
  rows: Record<string, unknown>[];
}

export interface NumericStatistics {
  min: number | null;
  max: number | null;
  mean: number | null;
  median: number | null;
  std: number | null;
}

export interface ColumnProfile {
  name: string;
  dtype: string;
  missing_count: number;
  missing_percent: number;
  unique_count: number;
  statistics: NumericStatistics | null;
}

export interface DatasetProfile {
  dataset_id: string;
  row_count: number;
  column_count: number;
  duplicate_rows: number;
  columns: ColumnProfile[];
  correlation: Record<string, Record<string, number | null>>;
}
