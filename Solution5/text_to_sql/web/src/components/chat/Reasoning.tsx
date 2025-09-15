import { useContext } from 'react';
import { QueryContext } from '../../contexts/QueryContext';
import { Loader2 } from 'lucide-react';

export default function Reasoning() {
  const queryContext = useContext(QueryContext);

  if (!queryContext) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin w-6 h-6 text-indigo-600" />
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    );
  }

  const { queries, selectedIndex } = queryContext;
  const currentEntry =
    selectedIndex !== null && selectedIndex < queries.length
      ? queries[selectedIndex]
      : null;

  const executionHistory = currentEntry?.execution_history;

  return (
    <div className="mt-4 w-full max-h-[70vh] h-99 relative overflow-auto p-4 bg-white dark:bg-gray-800 rounded scrollbar-thin scrollbar-thumb-indigo-600 scrollbar-track-gray-200 dark:scrollbar-thumb-indigo-400 dark:scrollbar-track-gray-700">
      {Array.isArray(executionHistory) ? (
      <ul className="space-y-2">
      {executionHistory.map((item, idx) => (
      <li key={idx} className="border-b pb-2 last:border-none border-gray-300 dark:border-gray-700">
        {Object.entries(item).map(([key, value]) => (
        <p key={key} className="text-sm text-gray-700 dark:text-gray-300">
        <strong>{key
        .replace(/_/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase())}: </strong>
        {String(value)}
        </p>
        ))}
      </li>
      ))}
      </ul>
      ) : (
      <p className="text-sm text-gray-700 dark:text-gray-300">
      {executionHistory}
      </p>
      )}
    </div>
  );
}
