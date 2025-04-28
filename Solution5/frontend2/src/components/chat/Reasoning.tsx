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
    <div className="mt-4 w-full max-h-[60vh] h-96 relative overflow-auto p-4 bg-white rounded">
      {Array.isArray(executionHistory) ? (
        <ul className="space-y-2">
          {executionHistory.map((item, idx) => (
            <li key={idx} className="border-b pb-2 last:border-none">
              {Object.entries(item).map(([key, value]) => (
                <p key={key} className="text-sm text-gray-700">
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
        <p className="text-sm text-gray-700">
          {executionHistory}
        </p>
      )}
    </div>
  );
}
