import React, { useEffect, useState } from 'react';
import * as monaco from 'monaco-editor';
import { IPublicClientApplication } from '@azure/msal-browser';
import MonacoEditor from 'react-monaco-editor';
import { enqueueSnackbar } from 'notistack';
import { getDatabases, getExamples, deleteExample, updateExample, addExample, IExample } from '../api/example';
import { Loader2, Edit2, Trash2, X } from 'lucide-react';

interface ExamplesManagerProps {
  msalInstance: IPublicClientApplication;
}

export default function QuestionQueryExample({ msalInstance }: ExamplesManagerProps) {
  const [databases, setDatabases] = useState<string[]>([]);
  const [selectedDatabase, setSelectedDatabase] = useState<string>('default');
  const [examples, setExamples] = useState<IExample[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [editOpen, setEditOpen] = useState<boolean>(false);
  const [createOpen, setCreateOpen] = useState<boolean>(false);
  const [current, setCurrent] = useState<IExample>({ doc_id: '', question: '', sql: '', sql_embedding: [] });
  const [newExample, setNewExample] = useState<IExample>({ doc_id: '', question: '', sql: '', sql_embedding: [] });

  // Monaco config
  useEffect(() => {
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({ noSemanticValidation: false, noSyntaxValidation: false });
  }, []);

  // Fetch databases
  useEffect(() => {
    setLoading(true);
    getDatabases(msalInstance)
      .then(dbs => {
        setDatabases(dbs);
        if (dbs.length) setSelectedDatabase(dbs[0]);
      })
      .catch(err => enqueueSnackbar(`Error fetching databases: ${(err as Error).message}`, { variant: 'error' }))
      .finally(() => setLoading(false));
  }, [msalInstance]);

  // Fetch examples when database changes
  useEffect(() => {
    if (!selectedDatabase || selectedDatabase === 'default') return;
    setLoading(true);
    getExamples(msalInstance, selectedDatabase)
      .then(setExamples)
      .catch(err => enqueueSnackbar(`Error fetching examples: ${(err as Error).message}`, { variant: 'error' }))
      .finally(() => setLoading(false));
  }, [selectedDatabase, msalInstance]);

  const handleDel = (id: string) => {
    if (!confirm('Are you sure you want to delete this example?')) return;
    setLoading(true);
    deleteExample(msalInstance, id, selectedDatabase)
      .then(() => setExamples(prev => prev.filter(e => e.doc_id !== id)))
      .catch(err => enqueueSnackbar(`Error deleting example: ${(err as Error).message}`, { variant: 'error' }))
      .finally(() => setLoading(false));
  };

  const openEdit = (ex: IExample) => { setCurrent(ex); setEditOpen(true); };
  const saveEdit = () => {
    setLoading(true);
    updateExample(msalInstance, current.doc_id, current.question, current.sql, selectedDatabase)
      .then(() => setExamples(prev => prev.map(e => e.doc_id === current.doc_id ? current : e)))
      .catch(err => enqueueSnackbar(`Error updating example: ${(err as Error).message}`, { variant: 'error' }))
      .finally(() => { setLoading(false); setEditOpen(false); });
  };

  const openCreate = () => { setNewExample({ doc_id: '', question: '', sql: '', sql_embedding: [] }); setCreateOpen(true); };
  const saveCreate = () => {
    setLoading(true);
    addExample(msalInstance, newExample.question, newExample.sql, selectedDatabase)
      .then(() => setExamples(prev => [...prev, newExample]))
      .catch(err => enqueueSnackbar(`Error adding example: ${(err as Error).message}`, { variant: 'error' }))
      .finally(() => { setLoading(false); setCreateOpen(false); });
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-900">
      {/* Loading bar */}
      {loading ? (
        <div className="h-1 bg-indigo-600 dark:bg-indigo-500 animate-pulse" />
      ) : (
        <div className="h-1" />
      )}

      {/* Controls */}
      <div className="flex items-center mt-4 mb-2 space-x-4">
        <select
          className="border border-gray-300 dark:border-gray-600 rounded p-2 focus:outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          value={selectedDatabase}
          onChange={e => setSelectedDatabase(e.target.value)}
        >
          {databases.map(db => (<option key={db} value={db}>{db}</option>))}
        </select>
        <button
          className="bg-indigo-600 dark:bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-500 dark:hover:bg-indigo-400 focus:outline-none"
          onClick={openCreate}
        >
          Create New
        </button>
      </div>

      {/* Examples Table */}
      <div className="overflow-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 table-auto">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200 whitespace-normal break-words">Question</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200 whitespace-normal break-words">SQL</th>
              <th className="px-4 py-2 text-center text-sm font-medium text-gray-700 dark:text-gray-200" colSpan={2}>Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-700">
            {examples.map(ex => (
              <tr key={ex.doc_id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-100 whitespace-normal break-words">{ex.question}</td>
                <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-100 whitespace-normal break-words">{ex.sql}</td>
                <td className="px-4 py-2 text-center">
                  <button onClick={() => openEdit(ex)} className="p-1 hover:text-indigo-600 dark:hover:text-indigo-400 focus:outline-none" aria-label="Edit">
                    <Edit2 className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  </button>
                </td>
                <td className="px-4 py-2 text-center">
                  <button onClick={() => handleDel(ex.doc_id)} className="p-1 hover:text-red-600 dark:hover:text-red-400 focus:outline-none" aria-label="Delete">
                    <Trash2 className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-300 w-4/5 h-4/5 rounded shadow-lg overflow-auto">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-500">Edit Example</h3>
              <button onClick={() => setEditOpen(false)} className="p-1 focus:outline-none" aria-label="Close">
                <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
            <div className="p-4 space-y-4 h-full flex flex-col" style={{ height: '80%' }}>
              <input
                type="text"
                className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none"
                value={current.question}
                onChange={e => setCurrent(prev => ({ ...prev, question: e.target.value }))}
                placeholder="Question"
              />
              <div className="flex-1 border border-gray-300 dark:border-gray-600 rounded ">
                <MonacoEditor
                  language="sql"
                  theme="vs-dark"
                  value={current.sql}
                  options={{ automaticLayout: true, minimap: { enabled: false } }}
                  onChange={val => setCurrent(prev => ({ ...prev, sql: val || '' }))}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 p-4 border-t border-gray-200 dark:border-gray-700">
              <button onClick={() => setEditOpen(false)} className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none">
                Cancel
              </button>
              <button onClick={saveEdit} className="px-4 py-2 rounded bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-500 dark:hover:bg-indigo-400 focus:outline-none">
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {createOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-300 w-4/5 h-4/5 rounded shadow-lg overflow-auto">
          <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-500">Create New Example</h3>
              <button onClick={() => setCreateOpen(false)} className="p-1 focus:outline-none" aria-label="Close">
                <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
            <div className="p-4 space-y-4 h-full flex flex-col" style={{ height: '80%' }}>
              <input
              type="text"
              className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none"
              value={newExample.question}
              onChange={e => setNewExample(prev => ({ ...prev, question: e.target.value }))}
              placeholder="Question"
              />
                <div className="flex-1 border border-gray-300 dark:border-gray-600 rounded ">
                  <MonacoEditor
                  language="sql"
                  theme="vs-dark"
                  value={newExample.sql}
                  options={{ automaticLayout: true, minimap: { enabled: false } }}
                  onChange={val => setNewExample(prev => ({ ...prev, sql: val || '' }))}
                  />
                </div>
            </div>
              
            <div className="flex justify-end space-x-2 p-4 border-t border-gray-200 dark:border-gray-700">
              <button onClick={() => setCreateOpen(false)} className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none">
                Cancel
              </button>
              <button onClick={saveCreate} className="px-4 py-2 rounded bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-500 dark:hover:bg-indigo-400 focus:outline-none">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
