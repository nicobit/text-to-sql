// src/api/llm.ts
import { IPublicClientApplication } from "@azure/msal-browser";
import { API_BASE_URL } from "@/constants";
import { loginRequest } from "@/authConfig";

/* ---------- Types (minimal & flexible) ---------- */

export type Healthz = { status: "ok"; time: string };

export type UsageDayRow = {
  PartitionKey: string; // user_id
  RowKey: string;       // YYYYMMDD
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  quota: number;
  model?: string;
};

export type UsageRange = {
  user_id: string;
  from_date: string; // YYYY-MM-DD
  to_date: string;   // YYYY-MM-DD
  total_prompt_tokens: number;
  total_completion_tokens: number;
  total_tokens: number;
  daily: UsageDayRow[];
};

export type ChatMessage = {
  role: "system" | "user" | "assistant" | "tool" | string;
  content: any; // string or OpenAI content parts
  name?: string;
};

export type ChatCompletionPayload = {
  model?: string;
  messages: ChatMessage[];
  stream?: boolean;
  [key: string]: any; // pass-through extras (tools, temperature, etc.)
};

export type ChatChoiceDelta = {
  index: number;
  delta?: { role?: string; content?: string; [k: string]: any };
  message?: { role?: string; content?: string; [k: string]: any };
  finish_reason?: string | null;
};

export type ChatCompletionChunk = {
  id?: string;
  object?: string;
  created?: number;
  model?: string;
  choices: ChatChoiceDelta[];
  usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
};

export type ChatCompletionResponse = {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    finish_reason?: string | null;
    message: { role: string; content: string; [k: string]: any };
  }>;
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
};

export type EmbeddingsPayload = {
  input: string | string[] | number[] | number[][];
  model?: string;
  [key: string]: any;
};

export type EmbeddingsResponse = {
  data: Array<{ embedding: number[]; index: number }>;
  usage?: { prompt_tokens?: number; total_tokens?: number; completion_tokens?: number };
  model?: string;
  object?: string;
};

/* ---------- Internals ---------- */

const DEFAULT_AOAI_API_VERSION = "2024-10-21";

async function authFetch(
  instance: IPublicClientApplication,
  input: RequestInfo | URL,
  init?: RequestInit
) {
  const { accessToken } = await instance.acquireTokenSilent(loginRequest);
  const headers = new Headers(init?.headers || {});
  // Accept may be overridden for SSE
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (!headers.has("Accept")) headers.set("Accept", "application/json");
  headers.set("Authorization", `Bearer ${accessToken}`);

  return fetch(input, { credentials: "include", ...init, headers });
}

function withQuery(url: string, params: Record<string, string | number | boolean | undefined>) {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) usp.append(k, String(v));
  });
  return usp.toString() ? `${url}?${usp.toString()}` : url;
}

/* ---------- Public API ---------- */

// Health
export async function getHealth(instance: IPublicClientApplication, signal?: AbortSignal): Promise<Healthz> {
  const res = await authFetch(instance, `${API_BASE_URL}/llm/healthz`, { method: "GET", signal });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Usage
export async function getUsageToday(instance: IPublicClientApplication, signal?: AbortSignal): Promise<UsageDayRow> {
  const res = await authFetch(instance, `${API_BASE_URL}/llm/usage/today`, { method: "GET", signal });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getUsageRange(
  instance: IPublicClientApplication,
  fromISO: string, // "YYYY-MM-DD"
  toISO: string,   // "YYYY-MM-DD"
  signal?: AbortSignal
): Promise<UsageRange> {
  const url = withQuery(`${API_BASE_URL}/llm/usage/range`, { from_date: fromISO, to_date: toISO });
  const res = await authFetch(instance, url, { method: "GET", signal });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Quota
export async function setQuota(
  instance: IPublicClientApplication,
  targetUserId: string,
  quota: number,
  signal?: AbortSignal
): Promise<{ user_id: string; quota: number }> {
  const url = withQuery(`${API_BASE_URL}/llm/quota/${encodeURIComponent(targetUserId)}`, { quota });
  const res = await authFetch(instance, url, { method: "PUT", signal });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/* ----- Chat Completions (non-stream) ----- */
export async function chatCompletions(
  instance: IPublicClientApplication,
  deployment: string,
  payload: ChatCompletionPayload,
  opts?: { apiVersion?: string; signal?: AbortSignal }
): Promise<ChatCompletionResponse> {
  const apiVersion = opts?.apiVersion ?? DEFAULT_AOAI_API_VERSION;
  const url = withQuery(
    `${API_BASE_URL}/llm/openai/deployments/${encodeURIComponent(deployment)}/chat/completions`,
    { "api-version": apiVersion }
  );

  // Ensure stream is off for this helper
  const body = JSON.stringify({ ...payload, stream: false });

  const res = await authFetch(instance, url, { method: "POST", body, signal: opts?.signal });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/* ----- Chat Completions (streaming SSE) ----- */
/**
 * Stream chat completions as an async iterator.
 * Usage:
 *   for await (const chunk of streamChatCompletions(instance, "gpt-4o-mini", payload)) {
 *     // chunk.choices[0].delta?.content ...
 *   }
 */
export async function* streamChatCompletions(
  instance: IPublicClientApplication,
  deployment: string,
  payload: ChatCompletionPayload,
  opts?: { apiVersion?: string; signal?: AbortSignal }
): AsyncGenerator<ChatCompletionChunk, void, unknown> {
  const apiVersion = opts?.apiVersion ?? DEFAULT_AOAI_API_VERSION;
  const url = withQuery(
    `${API_BASE_URL}/llm/openai/deployments/${encodeURIComponent(deployment)}/chat/completions`,
    { "api-version": apiVersion }
  );

  const { accessToken } = await instance.acquireTokenSilent(loginRequest);
  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "Accept": "text/event-stream",
    },
    body: JSON.stringify({ ...payload, stream: true }),
    signal: opts?.signal,
  });

  if (!res.ok || !res.body) {
    throw new Error(`Stream error: ${res.status} ${res.statusText} - ${await res.text()}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // SSE frames are separated by \n\n
      let idx: number;
      while ((idx = buffer.indexOf("\n\n")) !== -1) {
        const rawEvent = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 2);

        // Each line like: "data: {...}" or "event: ..." (we only care about data)
        const lines = rawEvent.split("\n").map((l) => l.trim());
        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          const data = line.slice(5).trim();
          if (!data) continue;
          if (data === "[DONE]") {
            return;
          }
          try {
            const json = JSON.parse(data) as ChatCompletionChunk;
            yield json;
          } catch {
            // Ignore malformed chunks; continue streaming
          }
        }
      }
    }
  } finally {
    try { reader.releaseLock(); } catch {}
  }
}

/* ----- OpenAI-style alias (non-stream; uses backend default deployment) ----- */
export async function openaiLikeChat(
  instance: IPublicClientApplication,
  payload: ChatCompletionPayload,
  opts?: { signal?: AbortSignal }
): Promise<ChatCompletionResponse> {
  const url = `${API_BASE_URL}/llm/v1/chat/completions`;
  const res = await authFetch(instance, url, { method: "POST", body: JSON.stringify(payload), signal: opts?.signal });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/* ----- Embeddings ----- */
export async function embeddings(
  instance: IPublicClientApplication,
  deployment: string,
  payload: EmbeddingsPayload,
  opts?: { apiVersion?: string; signal?: AbortSignal }
): Promise<EmbeddingsResponse> {
  const apiVersion = opts?.apiVersion ?? DEFAULT_AOAI_API_VERSION;
  const url = withQuery(
    `${API_BASE_URL}/llm/openai/deployments/${encodeURIComponent(deployment)}/embeddings`,
    { "api-version": apiVersion }
  );

  const res = await authFetch(instance, url, { method: "POST", body: JSON.stringify(payload), signal: opts?.signal });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
