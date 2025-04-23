// src/components/YahooStockTrace.tsx
import { API_BASE_URL } from '../../config/settings';
// src/components/YahooStockTrace.tsx
import  { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import Autocomplete from '@mui/material/Autocomplete';
import TextField    from '@mui/material/TextField';
import Box          from '@mui/material/Box';

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
  const [symbol, setSymbol]       = useState<SymbolOption | null>({ symbol: 'AAP', name: 'Advance Auto Parts' });
  const [inputValue, setInputValue] = useState('AAP');
  const [options, setOptions]     = useState<SymbolOption[]>([]);
  const [loadingSym, setLoadingSym] = useState(false);

  // --- Historical data state ---
  const [data, setData]           = useState<DataPoint[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError]         = useState<string | null>(null);

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
        const buf = await res.arrayBuffer();                                   // :contentReference[oaicite:7]{index=7}
        const txt = new TextDecoder('utf-8').decode(new Uint8Array(buf));      // :contentReference[oaicite:8]{index=8}
        const json = JSON.parse(txt);                                           // :contentReference[oaicite:9]{index=9}

        const list = (json.quotes || json.Result || []).slice(0, 10).map((r: any) => ({
          symbol: r.symbol,
          name:   r.shortname || r.name || r.longname || ''
        }));
        if (active) setOptions(list);
      } catch {
        /* ignore errors in suggestions */
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
        const buf = await res.arrayBuffer();                                   // :contentReference[oaicite:10]{index=10}
        const txt = new TextDecoder('utf-8').decode(new Uint8Array(buf));      // :contentReference[oaicite:11]{index=11}
        const payload = JSON.parse(txt);                                        // :contentReference[oaicite:12]{index=12}

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
    <Box sx={{ width: '100%', p: 2 }}>
      {/* Symbol autocomplete */}
      <Autocomplete
        getOptionLabel={(opt) => `${opt.symbol} — ${opt.name}`}
        options={options}
        loading={loadingSym}
        value={symbol}
        onChange={(_, v) => setSymbol(v)}
        inputValue={inputValue}
        onInputChange={(_, v) => setInputValue(v.toUpperCase())}
        sx={{ mb: 2, maxWidth: 300 }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Ticker"
            variant="outlined"
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loadingSym ? 'Loading…' : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
      />

      {/* Loading & error */}
      {loadingData && <div>Loading data for {symbol?.symbol}…</div>}
      {error       && <div style={{ color: 'red' }}>Error: {error}</div>}

      {/* Price chart */}
      {!loadingData && !error && data.length > 0 && (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" tick={{ fontSize: 12 }} />
            <YAxis domain={['dataMin', 'dataMax']} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v: number) => v.toFixed(2)} />
            <Line type="monotone" dataKey="price" stroke="#1976d2" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Box>
  );
}
