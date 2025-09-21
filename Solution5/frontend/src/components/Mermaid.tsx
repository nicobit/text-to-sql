import { useContext, useState } from 'react';
import { QueryContext } from '../contexts/QueryContext';
import { Loader2 } from 'lucide-react';
import MermaidDiagram from './MermaidDiagram';
import MonacoEditor from 'react-monaco-editor';
import { useTailwindDarkMode } from '../hooks/useTailwindDarkMode';

export default function ResultsTable() {
  const queryContext = useContext(QueryContext);
  const [mermaidText, setMermaidText] = useState<string>('');
  const isDark = useTailwindDarkMode();

  if (!queryContext) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="animate-spin w-6 h-6 text-indigo-600" />
      </div>
    );
  }

  const { queries, selectedIndex } = queryContext;
  const currentEntry =
    selectedIndex !== null && selectedIndex < queries.length
      ? queries[selectedIndex]
      : null;

  const initialMermaid = currentEntry?.mermaid || 'No Mermaid diagram available';

  // initialize once
  useState(() => setMermaidText(initialMermaid));

  return (
    <div className="flex gap-4 mt-4 p-4">
      {/* Editor Panel */}
      <div className="flex-1 bg-gray-100 dark:bg-gray-800 p-4 rounded">
      <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">Edit Mermaid Code</h2>
      <div className="border border-gray-300 dark:border-gray-700 rounded overflow-hidden h-[500px]">
        <MonacoEditor
        language="markdown"
        theme={isDark ? 'vs-dark' : 'vs'} //
        value={mermaidText}
        onChange={(value) => setMermaidText(value || '')}
        options={{
          fontFamily: 'monospace',
          fontSize: 14,
          minimap: { enabled: false },
          automaticLayout: true,
          theme: 'vs-dark', // Use 'vs-dark' for dark mode, 'vs' for light mode
        }}
        />
      </div>
      </div>

      {/* Diagram Panel */}
      <div className="flex-1 bg-gray-100 dark:bg-gray-800 p-4 rounded">
      <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">Mermaid Diagram</h2>
      <div className="border border-gray-300 dark:border-gray-700 rounded h-[500px] overflow-auto p-2">
        <MermaidDiagram chart={mermaidText} />
      </div>
      </div>
    </div>
  );
}
