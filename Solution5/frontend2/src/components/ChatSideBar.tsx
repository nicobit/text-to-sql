import React, { useContext } from 'react';
import { QueryContext } from '../contexts/QueryContext';
import { Loader2 } from 'lucide-react';

export default function ChatSidebar() {
  const queryContext = useContext(QueryContext);

  if (!queryContext) {
    return (
      <div className="flex items-center justify-center h-24">
        <Loader2 className="animate-spin w-6 h-6 text-indigo-600" />
      </div>
    );
  }

  const { queries, selectQuery } = queryContext;

  return (
    <aside className="w-60 p-4 border-r border-gray-200 dark:border-gray-700 h-full overflow-y-auto bg-white dark:bg-gray-800">
      
      <h2 className="text-sm font-semibold text-gray-700  dark:text-gray-500 mb-2">Previous Queries:</h2>
      <ul className="space-y-1">
        {queries.length > 0 ? (
          queries.map((entry, idx) => (
            <li key={idx}>
              <button
                onClick={() => selectQuery(idx)}
                className="w-full text-left py-2 px-2 rounded hover:bg-gray-100  focus:outline-none"
              >
                <span className="block truncate" title={entry.query}>
                  {entry.query}
                </span>
              </button>
            </li>
          ))
        ) : (
          <li className="py-2 text-gray-500">(No queries yet)</li>
        )}
      </ul>
      <hr className="mt-2 dark:border-gray-700" />
    </aside>
  );
}
