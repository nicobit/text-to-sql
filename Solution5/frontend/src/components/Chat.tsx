import { useState, useContext, FormEvent, useRef, useEffect } from 'react';
import { QueryContext } from '../contexts/QueryContext';
import ReactMarkdown from 'react-markdown';
import LoadingIndicator from './LoadingIndicator';
import ResultsTable from '../components/ResultsTable';
import BarChart from '../components/BarChart';
import MermaidDiagram from './MermaidDiagram';
import Mermaid from './Mermaid';
import Reasoning from './chat/Reasoning';
import {
  Loader2,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Volume2,
  Table,
  X,
  ChevronUp,
  ChevronDown,
  Maximize2,
  Minimize2,
  Speaker,
  ArrowUp,
  MessageCircle,
} from 'lucide-react';

export default function Chat() {
  const queryContext = useContext(QueryContext);
  const listEndRef = useRef<HTMLLIElement | null>(null);

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [queryContext?.queries]);

  if (!queryContext) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin w-6 h-6 text-indigo-600" />
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    );
  }

  const { queries, runQuery, selectQuery } = queryContext;
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [selectedTab, setSelectedTab] = useState<number>(0);

  const handleSubmit = async (e: FormEvent) => {
    console.log('handleSubmit', input);
    e.preventDefault();
    if (!input.trim()) return;
    setInput('');
    setLoading(true);
    try {
      await runQuery(input.trim());
    } finally {
      setLoading(false);
    }
  };

  const toggleDialog = (idx?: number) => {
    if (idx !== undefined) selectQuery(idx);
    setIsDialogOpen(prev => !prev);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat history */}
      <ul className="flex-1 mb-4 overflow-y-auto space-y-4 overflow-y-scroll custom-scrollbar">
        {queries.map((entry, index) => (
          <li
            key={index}
            ref={index === queries.length - 1 ? listEndRef : null}
          >
            <p className="text-green-700 font-semibold">
              <strong>User:</strong> {entry.query}
            </p>
            {entry.error ? (
              <p className="text-red-600">
                <strong>Error:</strong> {entry.error}
              </p>
            ) : entry.answer || entry.mermaid ? (
              <div>
                {/* Reasoning section */}
                <div className="mt-2 pl-4 border-l-2 border-gray-300 text-gray-600">
                  <div
                    className="flex items-center justify-between cursor-pointer select-none"
                    onClick={() => {
                      const updated = [...queries];
                      updated[index].isExpanded = !updated[index].isExpanded;
                      queryContext.setQueries(updated);
                    }}
                  >
                    <span className="font-medium">Reasoning:</span>
                    <button className="p-1 focus:outline-none">
                      {entry.isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      )}
                    </button>
                  </div>
                  {entry.isExpanded && (
                    <div className="mt-1 prose prose-sm">
                      <ReactMarkdown>{entry.reasoning}</ReactMarkdown>
                    </div>
                  )}
                </div>

                {/* Answer and diagram */}
                <div className="mt-2">
                  <ReactMarkdown >
                    {entry.answer!}
                  </ReactMarkdown>
                  <MermaidDiagram chart={entry.mermaid || ''} />
                </div>

                <p className="text-gray-500 text-sm mt-1">
                  <strong>System:</strong> Query executed. Returned{' '}
                  {Array.isArray(entry.result)
                    ? entry.result.length
                    : 0}{' '}
                  rows.
                </p>

                {/* Actions */}
                <div className="flex space-x-2 mt-2">
                  <button
                    onClick={() => navigator.clipboard.writeText(entry.answer!)}
                    className="p-1 focus:outline-none"
                    aria-label="copy"
                  >
                    <Copy className="w-5 h-5 text-gray-500 hover:text-gray-700" />
                  </button>
                  <button className="p-1 focus:outline-none" aria-label="like">
                    <ThumbsUp className="w-5 h-5 text-gray-500 hover:text-gray-700" />
                  </button>
                  <button className="p-1 focus:outline-none" aria-label="dislike">
                    <ThumbsDown className="w-5 h-5 text-gray-500 hover:text-gray-700" />
                  </button>
                  <button className="p-1 focus:outline-none" aria-label="speak">
                    <Volume2 className="w-5 h-5 text-gray-500 hover:text-gray-700" />
                  </button>
                  {entry.result !== null && (
                    <button
                      onClick={() => toggleDialog(index)}
                      className="p-1 focus:outline-none"
                      aria-label="table"
                    >
                      <Table className="w-5 h-5 text-gray-500 hover:text-gray-700" />
                    </button>
                  )}
                </div>
              </div>
            ) : null}
          </li>
        ))}
        {loading ? <LoadingIndicator /> : <div className="h-2" />}
      </ul>
      
      {/* Input form */}
      <form
        onSubmit={handleSubmit}
        className="flex items-start p-2 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg bg-transparent"
      >
        <textarea
          rows={2}
          placeholder="Ask anything"
          className="flex-1 resize-none border-none focus:outline-none p-2 rounded-md dark:bg-gray-900 dark:text-white bg-transparent"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSubmit(e as unknown as FormEvent);
        }
          }}
        />
        <button
          type="submit"
          className={`ml-2 p-2 rounded-full focus:outline-none ${
        loading
          ? 'bg-gray-600 text-white hover:bg-gray-700 dark:bg-gray-500 dark:text-gray-200 dark:hover:bg-gray-600'
          : input.trim()
          ? 'bg-gray-600 text-white hover:bg-indigo-700 dark:bg-gray-500 dark:text-gray-200 dark:hover:bg-indigo-600'
          : 'bg-gray-400 text-gray-500 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-400 dark:hover:bg-gray-500'
          }`}
          aria-label={loading ? 'stop' : input.trim() ? 'send' : 'speak'}
        >
          {loading ? (
        <Loader2 className="w-6 h-6 animate-spin text-gray-100 dark:text-gray-100" />
          ) : input.trim() ? (
        <ArrowUp className="w-6 h-6 text-white dark:text-gray-200" />
          ) : (
        <MessageCircle className="w-6 h-6 text-gray-100 dark:text-gray-100" />
          )}
        </button>
      </form>

      {/* Modal */}
      {isDialogOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 w-full">
    <div
      className={`overflow-auto rounded-lg shadow-lg flex flex-col ${
        isFullScreen
          ? 'w-full h-full m-0'
          : 'w-[80%] max-h-[90vh] m-4' // Adjusted for 80% of the total page width
      } bg-white dark:bg-gray-800`} // Light and dark mode backgrounds
    >
      <div className="flex justify-between items-center p-4 border-b border-gray-300 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Results
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setIsFullScreen(prev => !prev)}
            className="p-1 focus:outline-none"
            aria-label="toggle fullscreen"
          >
            {isFullScreen ? (
              <Minimize2 className="w-5 h-5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" />
            ) : (
              <Maximize2 className="w-5 h-5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" />
            )}
          </button>
          <button
            onClick={() => toggleDialog()}
            className="p-1 focus:outline-none"
            aria-label="close"
          >
            <X className="w-5 h-5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" />
          </button>
        </div>
      </div>
      <nav className="border-b border-gray-300 dark:border-gray-700">
        <ul className="flex">
          {['Results Table', 'Chart', 'Mermaid Diagram', 'Reasoning'].map(
            (label, idx) => (
              <li
                key={idx}
                onClick={() => setSelectedTab(idx)}
                className={`cursor-pointer py-2 px-4 ${
                  selectedTab === idx
                    ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                {label}
              </li>
            )
          )}
        </ul>
      </nav>
      <div className="flex-1 overflow-auto min-h-[700px] p-4 bg-gray-50 dark:bg-gray-900">
        {selectedTab === 0 && <ResultsTable />}
        {selectedTab === 1 && <BarChart />}
        {selectedTab === 2 && <Mermaid />}
        {selectedTab === 3 && <Reasoning />}
      </div>
    </div>
  </div>
)}
    </div>
  );
}
