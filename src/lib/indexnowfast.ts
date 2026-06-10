import type { IndexingTier } from "./brand";

const BASE_URL =
  process.env.INDEXNOWFAST_API_URL ?? "https://www.indexnowfast.com/api/v1";

export type IndexNowFastError = {
  error: { code: string; message: string };
};

export type SubmitTaskResponse = {
  task_id: string;
  urls_count: number;
  credits_charged: number;
  tier: IndexingTier;
  vip?: boolean;
  status: string;
};

export type TaskUrlStatus = {
  url: string;
  status: string;
  indexed_at: string | null;
};

export type TaskDetailResponse = {
  task: {
    id: string;
    provider_task_id?: string | number | null;
    status: string;
    urls_count: number;
    credits_charged: number;
    tier: IndexingTier;
    vip?: boolean;
    created_at?: string;
  };
  urls: TaskUrlStatus[];
};

export type AccountResponse = {
  credit_balance: number;
  email: string;
  name: string;
};

function getApiKey() {
  const key = process.env.INDEXNOWFAST_API_KEY;
  if (!key) {
    throw new Error("INDEXNOWFAST_API_KEY is not configured");
  }
  return key;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = data as IndexNowFastError;
    throw new Error(err.error?.message ?? `Indexing service error (${res.status})`);
  }

  return data as T;
}

export async function getAccountBalance() {
  return request<AccountResponse>("/account");
}

export async function submitUrls(urls: string[], tier: IndexingTier = "standard") {
  return request<SubmitTaskResponse>("/tasks", {
    method: "POST",
    body: JSON.stringify({ urls, tier }),
  });
}

export async function getTaskStatus(taskId: string) {
  return request<TaskDetailResponse>(`/tasks/${taskId}`);
}

export async function listTasks(limit = 20, cursor?: string) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor) params.set("cursor", cursor);
  return request<{ tasks: SubmitTaskResponse[]; next_cursor: string | null }>(
    `/tasks?${params.toString()}`,
  );
}
