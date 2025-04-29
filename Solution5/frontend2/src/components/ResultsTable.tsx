import React, { useContext, useState } from 'react';
import { QueryContext } from '../contexts/QueryContext';
import { Loader2, Copy, Download, Code as CodeIcon } from 'lucide-react';

export default function ResultsTable() {
  const queryContext = useContext(QueryContext);
  const [showSql, setShowSql] = useState(false);

  if (!queryContext) {
    return (
      <div className="flex items-center justify-center h-48 bg-white dark:bg-gray-900">
        <Loader2 className="animate-spin w-6 h-6 text-indigo-600 dark:text-indigo-400" />
      </div>
    );
  }

  const { queries, selectedIndex } = queryContext;
  const current =
    selectedIndex !== null && selectedIndex < queries.length
      ? queries[selectedIndex]
      : null;

  const data =
    current && Array.isArray(current.result)
      ? (current.result as Record<string, any>[])
      : null;
  const error = current?.error || null;
  const sqlQuery = current?.sql_query || 'No SQL query available';

  if (error) {
    return <p className="mt-2 text-red-600 dark:text-red-400">Error: {error}</p>;
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 p-4 rounded">
        <p className="mt-2 text-gray-800 dark:text-gray-200">No results to display.</p>
        <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded">
          <pre className="whitespace-pre-wrap break-words font-mono text-sm text-gray-900 dark:text-gray-100">
            {sqlQuery}
          </pre>
        </div>
      </div>
    );
  }

  const columns = Object.keys(data[0]);

  const handleCopy = () => {
    const header = columns.join('\t');
    const rows = data.map(row => columns.map(col => row[col]).join('\t'));
    navigator.clipboard.writeText(`${header}\n${rows.join('\n')}`);
  };

  const handleDownload = () => {
    const rows = [columns, ...data.map(row => columns.map(col => row[col]))];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'table_data.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-red dark:bg-gray-900 p-4 rounded h-full flex flex-col">
      {/* Actions */}
      <div className="flex justify-end space-x-2 mb-2">
        <button
          onClick={handleCopy}
          className="flex items-center px-2 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none"
        >
          <Copy className="w-4 h-4 mr-1 text-gray-600 dark:text-gray-300" />
          Copy
        </button>
        <button
          onClick={handleDownload}
          className="flex items-center px-2 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none"
        >
          <Download className="w-4 h-4 mr-1 text-gray-600 dark:text-gray-300" />
          Download
        </button>
        <button
          onClick={() => setShowSql(prev => !prev)}
          className="flex items-center px-2 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none"
        >
          <CodeIcon className="w-4 h-4 mr-1 text-gray-600 dark:text-gray-300" />
          {showSql ? 'Hide SQL' : 'Show SQL'}
        </button>
      </div>

      {/* SQL Query */}
      {showSql && (
        <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-800 rounded">
          <pre className="whitespace-pre-wrap break-words font-mono text-sm text-gray-900 dark:text-gray-100">
            {sqlQuery}
          </pre>
        </div>
      )}

      {/* Data Table */}
      <div className="max-h-[60vh] overflow-auto border border-gray-200 dark:border-gray-700 rounded">
        <table className="min-w-full min-h-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
            <tr>
              {columns.map(col => (
                <th
                  key={col}
                  className="px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-200"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-700">
            {data.map((row, i) => (
              <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                {columns.map(col => (
                  <td key={`${col}-${i}`} className="px-3 py-2 text-gray-800 dark:text-gray-100">
                    {row[col] !== undefined ? String(row[col]) : ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
