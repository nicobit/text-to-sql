// src/api/health_status.ts
import { IPublicClientApplication } from "@azure/msal-browser";
import { API_BASE_URL } from "../constants";
import { loginRequest } from "../authConfig";

export type OverallStatus = "pass" | "fail" | "degraded";

export type CheckStatus = "pass" | "fail" | "skip";

export interface CheckResult {
  name: string;
  status: CheckStatus;
  latency_ms?: number | null;
  error?: string | null;
  details?: Record<string, any> | null;
}

export interface HealthResponse {
  status: OverallStatus;
  results: CheckResult[];
}

async function authFetch(
  instance: IPublicClientApplication,
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const { accessToken } = await instance.acquireTokenSilent(loginRequest);
  const headers = new Headers(init?.headers || {});
  headers.set("Content-Type", "application/json");
  headers.set("Accept", "application/json");
  headers.set("Authorization", `Bearer ${accessToken}`);

  return fetch(input, {
    credentials: "include",
    ...init,
    headers,
  });
}

export async function getLiveness(
  instance: IPublicClientApplication,
  signal?: AbortSignal
): Promise<{ status: string }> {
  const res = await authFetch(instance, `${API_BASE_URL}/health/healthz`, { method: "GET", signal });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getReadiness(
  instance: IPublicClientApplication,
  signal?: AbortSignal
): Promise<HealthResponse> {
  const res = await authFetch(instance, `${API_BASE_URL}/health/readyz`, { method: "GET", signal });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
