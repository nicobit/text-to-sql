// src/api/healthConfig.ts
import { IPublicClientApplication } from "@azure/msal-browser";
import { API_BASE_URL } from "../constants";
import { loginRequest } from "../authConfig";

/** ---------- Types that match your FastAPI models ---------- */

export type FieldSource =
  | { source: "inline"; value: unknown }
  | { source: "settings"; setting_name: string }
  | {
      source: "kv";
      key_vault: { vault_uri: string; secret_name: string };
    }
  | { source: string; [k: string]: any }; // future-proof

export interface ServiceConfig {
  name: string;
  type: string;
  enabled: boolean;
  // arbitrary shape: each property may be a FieldSource or literal/nested object
  config: Record<string, any>;
}

export interface ServicesConfig {
  default_timeout_seconds?: number | null;
  services: ServiceConfig[];
}

export interface StoredConfig {
  etag?: string | null;
  config: ServicesConfig;
}

/** ---------- Helper to acquire a token + call fetch ---------- */

async function authFetch(instance: IPublicClientApplication, input: RequestInfo | URL, init?: RequestInit) {
  const { accessToken } = await instance.acquireTokenSilent(loginRequest);
  const headers = new Headers(init?.headers || {});
  headers.set("Content-Type", "application/json");
  headers.set("Accept", "application/json");
  headers.set("Authorization", `Bearer ${accessToken}`);
  return fetch(input, { credentials: "include", ...init, headers });
}

export async function getConfigSchema(instance: IPublicClientApplication) {
  const res = await authFetch(instance, `${API_BASE_URL}/health/config/schema`, { method: "GET" });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function validateConfig(instance: IPublicClientApplication, cfg: unknown) {
  const res = await authFetch(instance, `${API_BASE_URL}/health/config/validate`, {
    method: "POST",
    body: JSON.stringify(cfg),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<{ ok: boolean; errors: Array<{ loc: string[]; msg: string }> }>;
}


async function ensureOk(res: Response) {
  if (!res.ok) {
    let msg = `${res.status} ${res.statusText}`;
    try {
      const text = await res.text();
      msg = text || msg;
    } catch {}
    const err: any = new Error(msg);
    err.status = res.status;
    throw err;
  }
}

/** ---------- API ---------- */

const BASE = `${API_BASE_URL}/health/config`;

export class HealthConfigApi {
  private etag: string | null = null;

  constructor(private instance: IPublicClientApplication) {}

  /** Returns the full config and caches the current ETag. */
  async getConfig(signal?: AbortSignal): Promise<StoredConfig> {
    const res = await authFetch(this.instance, `${BASE}`, { method: "GET", signal });
    await ensureOk(res);
    const data = (await res.json()) as StoredConfig;
    this.etag = data.etag ?? null;
    return data;
  }

  /** Replaces the entire config (sends If-Match automatically if we have an ETag). */
  async putConfig(cfg: ServicesConfig, signal?: AbortSignal): Promise<StoredConfig> {
    const headers: Record<string, string> = {};
    if (this.etag) headers["If-Match"] = this.etag;

    const res = await authFetch(this.instance, `${BASE}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(cfg),
      signal,
    });
    await ensureOk(res);
    const data = (await res.json()) as StoredConfig;
    this.etag = data.etag ?? null; // refresh cache with server's ETag
    return data;
  }

  /** List all services (as ServiceConfig[]). */
  async listServices(signal?: AbortSignal): Promise<ServiceConfig[]> {
    const res = await authFetch(this.instance, `${BASE}/services`, { method: "GET", signal });
    await ensureOk(res);
    return (await res.json()) as ServiceConfig[];
  }

  /** Get a single service by name. */
  async getService(name: string, signal?: AbortSignal): Promise<ServiceConfig> {
    const res = await authFetch(this.instance, `${BASE}/services/${encodeURIComponent(name)}`, {
      method: "GET",
      signal,
    });
    await ensureOk(res);
    return (await res.json()) as ServiceConfig;
  }

  /**
   * Add a service.
   * Note: your backend returns the created ServiceConfig (not the new ETag),
   * so we do a cheap refresh of the config afterward to keep the ETag cache correct.
   */
  async addService(svc: ServiceConfig, signal?: AbortSignal): Promise<ServiceConfig> {
    const headers: Record<string, string> = {};
    if (this.etag) headers["If-Match"] = this.etag;

    const res = await authFetch(this.instance, `${BASE}/services`, {
      method: "POST",
      headers,
      body: JSON.stringify(svc),
      signal,
    });
    await ensureOk(res);
    const created = (await res.json()) as ServiceConfig;

    // Refresh to update local ETag (backend doesn't return it on POST)
    await this.getConfig(signal);
    return created;
  }

  /**
   * Update an existing service by name.
   * As with POST, refresh the full config to keep ETag cache correct.
   */
  async updateService(name: string, svc: ServiceConfig, signal?: AbortSignal): Promise<ServiceConfig> {
    const headers: Record<string, string> = {};
    if (this.etag) headers["If-Match"] = this.etag;

    const res = await authFetch(this.instance, `${BASE}/services/${encodeURIComponent(name)}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(svc),
      signal,
    });
    await ensureOk(res);
    const updated = (await res.json()) as ServiceConfig;

    await this.getConfig(signal);
    return updated;
  }

  /**
   * Delete a service by name.
   * Refresh the config to keep our ETag cache consistent.
   */
  async deleteService(name: string, signal?: AbortSignal): Promise<void> {
    const headers: Record<string, string> = {};
    if (this.etag) headers["If-Match"] = this.etag;

    const res = await authFetch(this.instance, `${BASE}/services/${encodeURIComponent(name)}`, {
      method: "DELETE",
      headers,
      signal,
    });
    await ensureOk(res);

    await this.getConfig(signal);
  }

  /** Optional: expose the last known ETag (for UI/debug). */
  get currentEtag() {
    return this.etag;
  }
}
