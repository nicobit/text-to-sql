// src/api/costs.ts
import { IPublicClientApplication } from "@azure/msal-browser";
import { API_BASE_URL } from "../constants";
import { loginRequest } from "../authConfig";

/** -------- Shared auth fetch -------- */
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

/** -------- Types -------- */
export type CacheKind = "redis" | "memory";

export interface CostsHealth {
    ok: boolean;
    cache: CacheKind;
    ttl: number;
}

// Adjusted to match costs/increase/month response
export interface IncreaseItem {
    service_name: string;              // Azure service name
    current_cost: number;              // Current period cost
    previous_cost: number;             // Previous period cost
    abs_change: number;                // Absolute change
    pct_change: number | null;         // Percentage change
    share_of_increase_pct: number;     // Share of total increase (percentage, 0..100)
}

export interface IncreaseResponse {
    scope: string;
    currency: string;
    granularity: "Monthly" | "Weekly (ISO)";
    period_current: string;            // ISO date string
    period_previous: string;           // ISO date string
    items: IncreaseItem[];
}

export interface TopDriversResponse {
    scope: string;
    currency: string;
    granularity: "Monthly" | "Weekly (ISO)";
    period_current: string;
    period_previous: string;
    total_increase: number;
    drivers: IncreaseItem[];
}

/** -------- Helpers -------- */
function buildQuery(params: Record<string, string | number | boolean | undefined | null>) {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
        if (v === undefined || v === null) return;
        q.set(k, String(v));
    });
    return q.toString();
}

async function handleJson<T>(res: Response): Promise<T> {
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Request failed: ${res.status}`);
    }
    return res.json() as Promise<T>;
}

/** -------- Endpoints: /costs/health & /costs/admin/cache/clear -------- */
export async function getCostsHealth(
    instance: IPublicClientApplication,
    signal?: AbortSignal
): Promise<CostsHealth> {
    const res = await authFetch(instance, `${API_BASE_URL}/costs/health`, { method: "GET", signal });
    return handleJson<CostsHealth>(res);
}

export async function clearCostsCache(
    instance: IPublicClientApplication,
    signal?: AbortSignal
): Promise<{ cleared: boolean }> {
    const res = await authFetch(instance, `${API_BASE_URL}/costs/admin/cache/clear`, { method: "GET", signal });
    return handleJson<{ cleared: boolean }>(res);
}

/** -------- Endpoint: /costs/increase/month -------- */
export interface IncreaseByMonthParams {
    scope?: string;
    referenceDate?: string;
    noCache?: 0 | 1;
}

export async function getIncreaseByMonth(
    instance: IPublicClientApplication,
    params: IncreaseByMonthParams = {},
    signal?: AbortSignal
): Promise<IncreaseResponse> {
    const query = buildQuery({
        scope: params.scope,
        reference_date: params.referenceDate,
        no_cache: params.noCache ?? 0,
    });
    const url = `${API_BASE_URL}/costs/increase/month${query ? `?${query}` : ""}`;
    const res = await authFetch(instance, url, { method: "GET", signal });
    return handleJson<IncreaseResponse>(res);
}

/** -------- Endpoint: /costs/increase/week -------- */
export interface IncreaseByWeekParams {
    scope?: string;
    weeksWindow?: number;
    referenceEnd?: string;
    noCache?: 0 | 1;
}

export async function getIncreaseByWeek(
    instance: IPublicClientApplication,
    params: IncreaseByWeekParams = {},
    signal?: AbortSignal
): Promise<IncreaseResponse> {
    const query = buildQuery({
        scope: params.scope,
        weeks_window: params.weeksWindow ?? 1,
        reference_end: params.referenceEnd,
        no_cache: params.noCache ?? 0,
    });
    const url = `${API_BASE_URL}/costs/increase/week${query ? `?${query}` : ""}`;
    const res = await authFetch(instance, url, { method: "GET", signal });
    return handleJson<IncreaseResponse>(res);
}

/** -------- Endpoint: /costs/top-drivers -------- */
export type TopDriversMode = "month" | "week";

export interface TopDriversParams {
    scope?: string;
    mode?: TopDriversMode;
    weeksWindow?: number;
    referenceDate?: string;
    referenceEnd?: string;
    topN?: number;
    noCache?: 0 | 1;
}

export async function getTopDrivers(
    instance: IPublicClientApplication,
    params: TopDriversParams = {},
    signal?: AbortSignal
): Promise<TopDriversResponse> {
    const query = buildQuery({
        scope: params.scope,
        mode: params.mode ?? "month",
        weeks_window: params.weeksWindow,
        reference_date: params.referenceDate,
        reference_end: params.referenceEnd,
        top_n: params.topN ?? 5,
        no_cache: params.noCache ?? 0,
    });
    const url = `${API_BASE_URL}/costs/top-drivers${query ? `?${query}` : ""}`;
    const res = await authFetch(instance, url, { method: "GET", signal });
    return handleJson<TopDriversResponse>(res);
}
