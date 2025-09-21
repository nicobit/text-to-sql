// src/components/HealthStatusDashboard.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { IPublicClientApplication } from "@azure/msal-browser";
import { getLiveness, getReadiness, type HealthResponse, type CheckResult } from "../../api/health_status";
import FilterChip from "../FilterChip";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  CircleSlash2,
  Timer,
  Info,
  RefreshCcw,
  Activity,
} from "lucide-react";

type Props = {
  instance: IPublicClientApplication;
  /** default 30000 ms */
  pollMs?: number;
};

type Filter = "all" | "pass" | "degraded_or_skip" | "fail";

const STATUS_ORDER: Record<string, number> = { fail: 0, degraded: 1, skip: 1, pass: 2 };

export default function HealthStatusDashboard({ instance, pollMs = 30000 }: Props) {
  const [loading, setLoading] = useState(false);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const pollRef = useRef<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      // optional ping, ignore result; if it fails, readiness will surface the error anyway
      await getLiveness(instance).catch(() => null);
      const rd = await getReadiness(instance);
      setHealth(rd);
      setLastUpdated(new Date());
    } catch (e: any) {
      // surface a synthetic "down" view if fetch fails
      setHealth({
        status: "fail",
        results: [
          {
            name: "api",
            status: "fail",
            error: e?.message || "Failed to reach readiness endpoint",
          },
        ],
      });
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  };

  // first load
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // polling
  useEffect(() => {
    if (!autoRefresh) {
      if (pollRef.current) window.clearInterval(pollRef.current);
      pollRef.current = null;
      return;
    }
    pollRef.current = window.setInterval(load, pollMs) as unknown as number;
    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
      pollRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefresh, pollMs]);

  const overall = health?.status ?? "degraded";
  const overallUi = getOverallUi(overall);

  const filteredResults = useMemo(() => {
    let results = [...(health?.results || [])];
    // derive "degraded_or_skip" from individual check statuses (skip shows as neutral/degraded)
    if (filter === "pass") results = results.filter((r) => r.status === "pass");
    else if (filter === "fail") results = results.filter((r) => r.status === "fail");
    else if (filter === "degraded_or_skip") results = results.filter((r) => r.status === "skip" || r.status === "fail"); // degraded from overall, skip on item
    // sort: fail → degraded/skip → pass
    results.sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || a.name.localeCompare(b.name));
    return results;
  }, [health, filter]);

  return (
    <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
      {/* Loading bar */}
      {loading ? <div className="h-1 bg-indigo-600 dark:bg-indigo-500 animate-pulse" /> : <div className="h-1" />}

      {/* Overall banner */}
      <div
        className={`mt-4 mb-4 flex items-center gap-3 rounded-lg border px-4 py-3 ${overallUi.container} ${overallUi.border}`}
        role="status"
        aria-live="polite"
      >
        <overallUi.Icon className={`w-5 h-5 ${overallUi.icon}`} aria-hidden />
        <div className="flex-1">
          <div className="font-semibold text-sm">{overallUi.title}</div>
          <div className="text-xs opacity-80">
            {overallUi.message}
            {lastUpdated && (
              <>
                {" "}
                • Last updated:{" "}
                <time dateTime={lastUpdated.toISOString()}>
                  {lastUpdated.toLocaleString()}
                </time>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="inline-flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              className="rounded"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              aria-label="Toggle auto refresh"
            />
            Auto refresh (30s)
          </label>
          <button
            onClick={load}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none"
          >
            <RefreshCcw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="text-sm text-gray-600 dark:text-gray-300">Filter:</span>
        <FilterChip active={filter === "all"} onClick={() => setFilter("all")} label="All" />
        <FilterChip active={filter === "fail"} onClick={() => setFilter("fail")} label="Down" />
        <FilterChip
          active={filter === "degraded_or_skip"}
          onClick={() => setFilter("degraded_or_skip")}
          label="Degraded/Skipped"
        />
        <FilterChip active={filter === "pass"} onClick={() => setFilter("pass")} label="Operational" />
      </div>

      {/* Grid of services */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredResults.map((r) => (
          <ServiceCard key={r.name} item={r} />
        ))}
        {!filteredResults.length && (
          <div className="col-span-full text-center text-sm text-gray-500 dark:text-gray-400 py-6">
            No services to display.
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-6 text-xs text-gray-600 dark:text-gray-400 flex flex-wrap items-center gap-4">
        <span className="inline-flex items-center gap-1">
          <StatusDot kind="pass" /> Operational
        </span>
        <span className="inline-flex items-center gap-1">
          <StatusDot kind="degraded" /> Degraded
        </span>
        <span className="inline-flex items-center gap-1">
          <StatusDot kind="fail" /> Down
        </span>
        <span className="inline-flex items-center gap-1">
          <StatusDot kind="skip" /> Skipped
        </span>
      </div>
    </div>
  );
}

/* -------------------- Subcomponents -------------------- */

function ServiceCard({ item }: { item: CheckResult }) {
  const ui = getItemUi(item.status);
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`rounded-lg border ${ui.border} bg-white dark:bg-gray-900 overflow-hidden`}
      aria-labelledby={`svc-${item.name}`}
    >
      <div className="px-4 py-3 flex items-center gap-3">
        <ui.Icon className={`w-5 h-5 ${ui.icon}`} aria-hidden />
        <div className="flex-1 min-w-0">
          <div id={`svc-${item.name}`} className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
            {item.name}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded ${ui.pillBg} ${ui.pillText}`}>
              <StatusDot kind={item.status === "skip" ? "skip" : (item.status as any)} />
              {item.status === "pass" ? "Operational" : item.status === "fail" ? "Down" : item.status === "skip" ? "Skipped" : "Degraded"}
            </span>
            {typeof item.latency_ms === "number" && (
              <span className="inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                <Timer className="w-3 h-3" />
                {Math.round(item.latency_ms)} ms
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none"
          aria-expanded={open}
          aria-controls={`svc-details-${item.name}`}
        >
          <Info className="w-4 h-4" />
          Details
        </button>
      </div>

      {/* Details */}
      <div id={`svc-details-${item.name}`} className={`${open ? "block" : "hidden"} border-t border-gray-200 dark:border-gray-800`}>
        <div className="px-4 py-3 text-xs text-gray-800 dark:text-gray-200 space-y-2">
          {item.error && (
            <div className="text-red-600 dark:text-red-400">
              <strong>Error:</strong> {item.error}
            </div>
          )}
          <div className="overflow-auto max-h-60 rounded border border-gray-200 dark:border-gray-800">
            <pre className="p-3 text-[11px] leading-5 whitespace-pre-wrap break-words">
              {JSON.stringify(
                // show a compact detail object
                { status: item.status, latency_ms: item.latency_ms, error: item.error, details: item.details ?? {} },
                null,
                2
              )}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusDot({ kind }: { kind: "pass" | "degraded" | "fail" | "skip" }) {
  const cls =
    kind === "pass"
      ? "bg-emerald-500"
      : kind === "degraded"
      ? "bg-amber-500"
      : kind === "fail"
      ? "bg-red-500"
      : "bg-gray-400";
  return <span className={`inline-block w-2.5 h-2.5 rounded-full ${cls}`} aria-hidden />;
}

/* -------------------- UI helpers -------------------- */

function getOverallUi(status: "pass" | "fail" | "degraded") {
  if (status === "pass")
    return {
      Icon: CheckCircle2,
      title: "All systems operational",
      message: "No issues detected across dependent services.",
      container: "bg-emerald-50 dark:bg-emerald-900/20",
      border: "border-emerald-200 dark:border-emerald-800",
      icon: "text-emerald-600 dark:text-emerald-400",
    };
  if (status === "degraded")
    return {
      Icon: AlertTriangle,
      title: "Partial degradation",
      message: "Some checks were skipped or are experiencing minor issues.",
      container: "bg-amber-50 dark:bg-amber-900/20",
      border: "border-amber-200 dark:border-amber-800",
      icon: "text-amber-600 dark:text-amber-400",
    };
  return {
    Icon: XCircle,
    title: "Service disruption",
    message: "One or more critical checks are failing.",
    container: "bg-red-50 dark:bg-red-900/20",
    border: "border-red-200 dark:border-red-800",
    icon: "text-red-600 dark:text-red-400",
  };
}

function getItemUi(status: CheckResult["status"]) {
  if (status === "pass")
    return {
      Icon: CheckCircle2,
      border: "border-emerald-200 dark:border-emerald-800",
      icon: "text-emerald-600 dark:text-emerald-400",
      pillBg: "bg-emerald-50 dark:bg-emerald-900/30",
      pillText: "text-emerald-700 dark:text-emerald-300",
    };
  if (status === "fail")
    return {
      Icon: XCircle,
      border: "border-red-200 dark:border-red-800",
      icon: "text-red-600 dark:text-red-400",
      pillBg: "bg-red-50 dark:bg-red-900/30",
      pillText: "text-red-700 dark:text-red-300",
    };
  if (status === "skip")
    return {
      Icon: CircleSlash2,
      border: "border-gray-200 dark:border-gray-800",
      icon: "text-gray-500 dark:text-gray-300",
      pillBg: "bg-gray-100 dark:bg-gray-800",
      pillText: "text-gray-700 dark:text-gray-300",
    };
  // degraded (fallback)
  return {
    Icon: AlertTriangle,
    border: "border-amber-200 dark:border-amber-800",
    icon: "text-amber-600 dark:text-amber-400",
    pillBg: "bg-amber-50 dark:bg-amber-900/30",
    pillText: "text-amber-700 dark:text-amber-300",
  };
}
