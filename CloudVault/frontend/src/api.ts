export type FileRecord = {
  id: string;
  name: string;
  original_name: string;
  object_key: string;
  size: number;
  mime: string;
  extension: string;
  created_at: string;
  status: string;
  error: string | null;
  chunk_count: number;
  sha256: string;
  owned: number;
  starred?: number;
};
export type Stats = {
  total_files: number;
  total_bytes: number;
  chunks: number;
  statuses: Record<string, number>;
  types: Record<string, number>;
  recent: FileRecord[];
};
export type AWS = {
  connected: boolean;
  bucket: string;
  region: string;
  public_access_blocked: boolean | null;
  region_matches: boolean;
  note: string | null;
};
export type Settings = {
  region: string;
  bucket: string;
  prefix: string;
  storage_mode: string;
  model: string;
  dimension: number | null;
  model_loaded: boolean;
  model_error: string | null;
  max_upload_mb: number;
  chunk_tokens: number;
  overlap_tokens: number;
  max_extracted_chars: number;
  version: string;
  index_location: string;
};
export type SearchResult = {
  file: FileRecord;
  snippet: string;
  section: string;
  score: number;
  similarity: number | null;
  score_kind: string;
};
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch("/api" + path, {
    ...init,
    signal: init?.signal ?? AbortSignal.timeout(180000),
  });
  if (!response.ok) {
    const body = await response
      .json()
      .catch(() => ({ detail: "Request failed" }));
    throw new Error(
      typeof body.detail === "string"
        ? body.detail
        : JSON.stringify(body.detail),
    );
  }
  return response.json() as Promise<T>;
}
export function uploadFile(
  file: File,
  onProgress: (value: number) => void,
): Promise<FileRecord> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("POST", "/api/files/upload");
    request.timeout = 120000;
    request.upload.onprogress = (e) => {
      if (e.lengthComputable)
        onProgress(Math.round((e.loaded / e.total) * 100));
    };
    request.onload = () => {
      try {
        const data = JSON.parse(request.responseText);
        if (request.status >= 200 && request.status < 300) resolve(data);
        else reject(new Error(data.detail || "Upload failed"));
      } catch {
        reject(new Error("Invalid server response"));
      }
    };
    request.onerror = () =>
      reject(new Error("Network error. Check My Files before retrying."));
    request.ontimeout = () =>
      reject(new Error("Upload timed out. Check My Files before retrying."));
    const data = new FormData();
    data.append("file", file);
    request.send(data);
  });
}
export const bytes = (n: number) =>
  n < 1024
    ? `${n} B`
    : n < 1048576
      ? `${(n / 1024).toFixed(1)} KB`
      : `${(n / 1048576).toFixed(2)} MB`;
