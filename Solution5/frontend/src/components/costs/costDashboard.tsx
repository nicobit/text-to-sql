import React, { useEffect, useMemo, useRef, useState } from "react";
import { IPublicClientApplication } from "@azure/msal-browser";
import {
  getCostsHealth,
  getIncreaseByMonth,
  getIncreaseByWeek,
  getTopDrivers,
  type IncreaseResponse,
  type TopDriversResponse,
} from "@/api/costs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  RefreshCcw,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Settings2,
  Info,
  Shield,
  Clock,
} from "lucide-react";

/* =========================
   Props & local types
   ========================= */
type Props = {
  instance: IPublicClientApplication;
  defaultScope?: string;
  /** Default: "month" */
  defaultMode?: "month" | "week";
  /** Default: 2 (weeks) */
  defaultWeeksWindow?: number;
  /** Polling off by default (ms). Set e.g. 30000 to enable. */
  pollMs?: number | null;
};

type SortKey = "service" | "abs_change" | "pct_change" | "current" | "previous";

function cls(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

function formatCurrency(n: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(n);
  } catch {
    return `${currency} ${n.toLocaleString()}`;
  }
}

function formatPct(n: number | null | undefined) {
  if (n === null || n === undefined) return "—";
  return `${(n * 100).toFixed(1)}%`;
}

/* =========================
   Main component
   ========================= */
export default function CostsDashboard({
  instance,
  defaultScope,
  defaultMode = "month",
  defaultWeeksWindow = 2,
  pollMs = null,
}: Props) {
  const [mode, setMode] = useState<"month" | "week">(defaultMode);
  const [scope, setScope] = useState<string>(defaultScope || "");
  const [weeksWindow, setWeeksWindow] = useState<number>(defaultWeeksWindow);
  const [referenceDate, setReferenceDate] = useState<string>(""); // YYYY-MM-DD (month mode)
  const [referenceEnd, setReferenceEnd] = useState<string>(""); // YYYY-MM-DD (week mode)
  const [noCache, setNoCache] = useState<boolean>(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [health, setHealth] = useState<{ ok: boolean; cache: string; ttl: number } | null>(null);
  const [increase, setIncrease] = useState<IncreaseResponse | null>(null);
  const [drivers, setDrivers] = useState<TopDriversResponse | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [sortKey, setSortKey] = useState<SortKey>("abs_change");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [query, setQuery] = useState<string>("");

  const pollRef = useRef<number | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      // health
      const h = await getCostsHealth(instance).catch(() => null);
      if (h) setHealth(h);

      // increase + drivers
      const inc =
        mode === "month"
          ? await getIncreaseByMonth(instance, {
              scope: scope || undefined,
              referenceDate: referenceDate || undefined,
              noCache: noCache ? 1 : 0,
            })
          : await getIncreaseByWeek(instance, {
              scope: scope || undefined,
              weeksWindow,
              referenceEnd: referenceEnd || undefined,
              noCache: noCache ? 1 : 0,
            });
      setIncrease(inc);

      const drv = await getTopDrivers(instance, {
        scope: scope || undefined,
        mode,
        weeksWindow,
        referenceDate: referenceDate || undefined,
        referenceEnd: referenceEnd || undefined,
        topN: 8,
        noCache: noCache ? 1 : 0,
      });
      setDrivers(drv);

      setLastUpdated(new Date());
    } catch (e: any) {
      setError(e?.message || "Failed to load cost data.");
    } finally {
      setLoading(false);
    }
  };

  // first load
  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // reload when controls change
  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, scope, weeksWindow, referenceDate, referenceEnd, noCache]);

  // polling
  useEffect(() => {
    if (!pollMs) return;
    pollRef.current = window.setInterval(load, pollMs) as unknown as number;
    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
      pollRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pollMs]);

  const currency = increase?.currency || "CHF";
  const totalIncrease = useMemo(() => {
    if (!increase) return 0;
    return increase.items
      .map((i) => Math.max(0, i.abs_change || 0))
      .reduce((a, b) => a + b, 0);
  }, [increase]);

  const filteredSortedItems = useMemo(() => {
    let items = [...(increase?.items || [])];
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      items = items.filter((i) => i.service_name.toLowerCase().includes(q));
    }
    items.sort((a, b) => {
      let av: number | string = "";
      let bv: number | string = "";
      if (sortKey === "service") {
        av = a.service_name.toLowerCase();
        bv = b.service_name.toLowerCase();
      } else {
        av = (a as any)[sortKey] ?? 0;
        bv = (b as any)[sortKey] ?? 0;
      }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return items;
  }, [increase, query, sortKey, sortDir]);

  const chartData = useMemo(() => {
    const list = drivers?.drivers || [];
    // keep positive increases, top N already handled by API
    return list
      .filter((d) => (d.abs_change || 0) > 0)
      .map((d) => ({
        service: d.service_name,
        change: d.abs_change,
      }));
  }, [drivers]);

  const onSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "service" ? "asc" : "desc");
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            Azure Cost Increase
            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800">
              <Activity className="w-3 h-3" />
              {increase?.granularity || (mode === "month" ? "Monthly" : "Weekly")}
            </span>
          </h2>
          <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
            Period:&nbsp;
            {increase ? (
              <span>
                <strong>{increase.period_previous}</strong> → <strong>{increase.period_current}</strong>
              </span>
            ) : (
              "—"
            )}
            {lastUpdated && (
              <>
                {" "}
                • Last updated:{" "}
                <time dateTime={lastUpdated.toISOString()}>{lastUpdated.toLocaleString()}</time>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={load}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none"
            aria-label="Refresh"
          >
            <RefreshCcw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-3">
        <div className="lg:col-span-5 flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg border border-gray-300 dark:border-gray-700 overflow-hidden">
            <button
              className={cls(
                "px-3 py-1.5 text-sm",
                mode === "month"
                  ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200"
              )}
              onClick={() => setMode("month")}
            >
              Monthly
            </button>
            <button
              className={cls(
                "px-3 py-1.5 text-sm border-l border-gray-300 dark:border-gray-700",
                mode === "week"
                  ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200"
              )}
              onClick={() => setMode("week")}
            >
              Weekly
            </button>
          </div>

          <div className="relative">
            <Settings2 className="w-4 h-4 absolute left-2 top-2.5 text-gray-500" />
            <input
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              placeholder="/subscriptions/<id> or leave empty for default"
              className="pl-8 pr-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 w-80"
            />
          </div>

          <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200 ml-1">
            <input
              type="checkbox"
              className="rounded"
              checked={noCache}
              onChange={(e) => setNoCache(e.target.checked)}
            />
            Bypass cache
          </label>
        </div>

        <div className="lg:col-span-7 flex flex-wrap items-center gap-2 justify-start lg:justify-end">
          {mode === "month" ? (
            <input
              type="date"
              value={referenceDate}
              onChange={(e) => setReferenceDate(e.target.value)}
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
              aria-label="Reference date (any day in current month)"
              title="Reference date (YYYY-MM-DD in the current month)"
            />
          ) : (
            <>
              <div className="inline-flex items-center gap-2">
                <label className="text-xs text-gray-600 dark:text-gray-300">Weeks window</label>
                <select
                  value={weeksWindow}
                  onChange={(e) => setWeeksWindow(Number(e.target.value))}
                  className="px-2 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
                >
                  {[1, 2, 3, 4, 6, 8].map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </div>
              <div className="inline-flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <input
                  type="date"
                  value={referenceEnd}
                  onChange={(e) => setReferenceEnd(e.target.value)}
                  className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
                  aria-label="Reference end (exclusive)"
                  title="Reference end (YYYY-MM-DD, exclusive)"
                />
              </div>
            </>
          )}

          <div className="relative">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter by service…"
              className="pl-3 pr-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 w-56"
            />
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <div className="text-xs text-gray-500 dark:text-gray-400">Total increase</div>
          <div className="mt-1 flex items-center gap-2">
            <strong className="text-2xl">
              {formatCurrency(totalIncrease, currency)}
            </strong>
            <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {increase ? `${increase.period_previous} → ${increase.period_current}` : "—"}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <div className="text-xs text-gray-500 dark:text-gray-400">Currency</div>
          <div className="mt-1 text-2xl font-semibold">{currency}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">From API response</div>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <Shield className="w-4 h-4" /> Cache
          </div>
          <div className="mt-1 text-sm">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              {health?.cache ?? "—"}
            </span>
            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
              TTL: {health?.ttl ?? "—"}s
            </span>
          </div>
          <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
            {noCache ? "Bypassing cache" : "Using server-side cache"}
          </div>
        </div>
      </div>

      {/* Chart + details */}
      <div className="mt-4 grid grid-cols-1 xl:grid-cols-5 gap-4">
        {/* Bar chart of top drivers */}
        <div className="xl:col-span-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Top increase drivers</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <Info className="w-3.5 h-3.5" />
              Positive absolute change only
            </div>
          </div>
          <div className="h-64 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="service" angle={-20} textAnchor="end" height={50} interval={0} />
                <YAxis tickFormatter={(v) => formatCurrency(v, currency)} />
                <Tooltip
                  formatter={(value: any) => [formatCurrency(value as number, currency), "Increase"]}
                  labelFormatter={(label) => String(label)}
                />
                <Bar dataKey="change" fill="#4682b4" /> 
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Table */}
        <div className="xl:col-span-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 overflow-hidden">
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Services breakdown</div>
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800/60">
                <tr>
                  <Th label="Service" active={sortKey === "service"} dir={sortDir} onClick={() => onSort("service")} />
                  <Th label="Current" active={sortKey === "current"} dir={sortDir} onClick={() => onSort("current")} />
                  <Th label="Previous" active={sortKey === "previous"} dir={sortDir} onClick={() => onSort("previous")} />
                  <Th label="Abs Δ" active={sortKey === "abs_change"} dir={sortDir} onClick={() => onSort("abs_change")} />
                  <Th label="% Δ" active={sortKey === "pct_change"} dir={sortDir} onClick={() => onSort("pct_change")} />
                  <th className="px-3 py-2 text-left">Share</th>
                </tr>
              </thead>
              <tbody>
                {filteredSortedItems.map((i) => {
                  const up = (i.abs_change || 0) >= 0;
                  const share = i.share_of_increase_pct ?? 0;
                  return (
                    <tr key={i.service_name} className="border-t border-gray-200 dark:border-gray-800">
                      <td className="px-3 py-2 font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">
                        {i.service_name}
                      </td>
                      <td className="px-3 py-2 text-gray-800 dark:text-gray-200 whitespace-nowrap">
                        {formatCurrency(i.current_cost, currency)}
                      </td>
                      <td className="px-3 py-2 text-gray-800 dark:text-gray-200 whitespace-nowrap">
                        {formatCurrency(i.previous_cost, currency)}
                      </td>
                      <td
                        className={cls(
                          "px-3 py-2 font-medium whitespace-nowrap",
                          up ? "text-emerald-700 dark:text-emerald-300" : "text-red-600 dark:text-red-400"
                        )}
                      >
                        <span className="inline-flex items-center gap-1">
                          {up ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                          {formatCurrency(i.abs_change, currency)}
                        </span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span
                          className={cls(
                            "inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded",
                            i.pct_change !== null && (i.pct_change || 0) > 0
                              ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                          )}
                        >
                          {i.pct_change !== null ? formatPct(i.pct_change) : "—"}
                        </span>
                      </td>
                      <td className="px-3 py-2 w-48">
                        {/* share bar */}
                        <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded">
                          <div
                            className="h-2 rounded bg-indigo-500"
                            style={{ width: `${Math.min(100, Math.max(0, share * 100))}%` }}
                            aria-label={`Share of increase ${formatPct(share)}`}
                            title={`Share of increase ${formatPct(share)}`}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {!filteredSortedItems.length && (
                  <tr>
                    <td colSpan={6} className="px-3 py-6 text-center text-gray-500 dark:text-gray-400">
                      No data to display.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {error && (
            <div className="mt-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="mt-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-3 text-sm text-gray-700 dark:text-gray-200">
          Loading…
        </div>
      )}
    </div>
  );
}

/* =========================
   Sub-components
   ========================= */

function Th({
  label,
  active,
  dir,
  onClick,
}: {
  label: string;
  active: boolean;
  dir: "asc" | "desc";
  onClick: () => void;
}) {
  return (
    <th
      className={cls(
        "px-3 py-2 text-left text-xs uppercase tracking-wider select-none",
        active ? "text-gray-900 dark:text-gray-100" : "text-gray-500 dark:text-gray-400"
      )}
    >
      <button onClick={onClick} className="inline-flex items-center gap-1">
        {label}
        {active && (
          <span aria-hidden className="text-[10px]">
            {dir === "asc" ? "▲" : "▼"}
          </span>
        )}
      </button>
    </th>
  );
}
