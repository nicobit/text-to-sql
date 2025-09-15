// src/components/YahooStockTrace.tsx
import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../constants';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  CartesianGrid,
} from 'recharts';
import { Search, Loader } from 'lucide-react';

interface SymbolOption {
  symbol: string;
  name:   string;
}

interface DataPoint {
  time:  string;
  price: number;
}

export default function YahooStockTrace() {
  // --- Symbol lookup state ---
  const [symbol, setSymbol]           = useState<SymbolOption | null>({ symbol: 'AAP', name: 'Advance Auto Parts' });
  const [inputValue, setInputValue]   = useState('AAP');
  const [options, setOptions]         = useState<SymbolOption[]>([]);
  const [loadingSym, setLoadingSym]   = useState(false);

  // --- Historical data state ---
  const [data, setData]               = useState<DataPoint[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError]             = useState<string | null>(null);

  /** Fetch symbol suggestions **/
  useEffect(() => {
    if (!inputValue) {
      setOptions([]);
      return;
    }
    let active = true;
    setLoadingSym(true);

    (async () => {
      try {
        const searchUrl = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(inputValue)}`;
        const proxyUrl  = `${API_BASE_URL}/dashboard/proxy?url=${encodeURIComponent(searchUrl)}`;

        const res = await fetch(proxyUrl);
        const buf = await res.arrayBuffer();
        const txt = new TextDecoder('utf-8').decode(new Uint8Array(buf));
        const json = JSON.parse(txt);

        const list = (json.quotes || json.Result || [])
          .slice(0, 10)
          .map((r: any) => ({
            symbol: r.symbol,
            name:   r.shortname || r.name || r.longname || '',
          }));
        if (active) setOptions(list);
      } catch {
        // ignore suggestion errors
      } finally {
        if (active) setLoadingSym(false);
      }
    })();

    return () => { active = false; };
  }, [inputValue]);

  /** Fetch price history for selected symbol **/
  useEffect(() => {
    if (!symbol) return;
    let cancelled = false;
    setLoadingData(true);
    setError(null);

    (async () => {
      try {
        const chartUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol.symbol}?range=1mo&interval=1d`;
        const proxyUrl = `${API_BASE_URL}/dashboard/proxy?url=${encodeURIComponent(chartUrl)}`;

        const res = await fetch(proxyUrl);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const buf     = await res.arrayBuffer();
        const txt     = new TextDecoder('utf-8').decode(new Uint8Array(buf));
        const payload = JSON.parse(txt);

        const result = payload.chart?.result?.[0];
        if (!result) throw new Error('No data returned');
        const ts    : number[] = result.timestamp;
        const close : number[] = result.indicators.quote[0].close;

        const pts: DataPoint[] = ts.map((t, i) => ({
          time : new Date(t * 1000).toLocaleDateString(),
          price: close[i],
        }));

        if (!cancelled) setData(pts);
      } catch (e: any) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoadingData(false);
      }
    })();

    return () => { cancelled = true; };
  }, [symbol]);

  return (
    <div className="w-full p-4">
      {/* Symbol autocomplete */}
      <div className="relative max-w-sm mb-4">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value.toUpperCase())}
          placeholder="Ticker"
          className="w-full p-2 pr-10 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          {loadingSym ? (
            <Loader className="w-5 h-5 animate-spin text-gray-500 dark:text-gray-400" />
          ) : (
            <Search className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          )}
        </div>
        {options.length > 0 && inputValue !== symbol?.symbol && (
          <ul className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded max-h-60 overflow-y-auto">
            {options.map((opt) => (
              <li key={opt.symbol}>
          <button
            onClick={() => {
              setSymbol(opt);
              setOptions([]);
            }}
            className="flex items-center w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
          >
            <span className="font-medium">{opt.symbol}</span>
            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">{opt.name}</span>
          </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Loading & error */}
      {loadingData && (
        <div className="text-gray-700 dark:text-gray-300">
          Loading data for {symbol?.symbol}…
        </div>
      )}
      {error && <div className="text-red-500">Error: {error}</div>}

      {/* Price chart */}
      {!loadingData && !error && data.length > 0 && (
        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis dataKey="time" tick={{ fontSize: 12 }} />
              <YAxis domain={[ 'dataMin', 'dataMax' ]} tick={{ fontSize: 12 }} />
              <ReTooltip formatter={(v: number) => v.toFixed(2)} />
              <Line type="monotone" dataKey="price" stroke="#3b82f6" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
