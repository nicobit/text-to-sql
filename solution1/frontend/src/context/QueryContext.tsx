import { createContext, useState, ReactNode } from 'react';
import { submitQuery } from '../api/api';
import { useAuth } from './AuthContext';
import { useMsal } from "@azure/msal-react";


interface Query {
  query: string;
  result: any;
  error: string | null;
}

interface QueryContextType {
  queries: Query[];
  runQuery: (queryText: string) => Promise<void>;
  selectedIndex: number | null;
  selectQuery: (index: number) => void;
}

export const QueryContext = createContext<QueryContextType | null>(null);

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queries, setQueries] = useState<Query[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const { isAuthenticated } = useAuth();
  const { instance } = useMsal();

  const runQuery = async (queryText: string) => {
    if (!isAuthenticated) {
      console.warn('User not authenticated');
      return;
    }
    try {
      const resultData = await submitQuery(instance, queryText);
      setQueries(prev => {
        const newEntry: Query = { query: queryText, result: resultData.results, error: null };
        return [...prev, newEntry];
      });
      setSelectedIndex(queries.length);
    } catch (err: any) {
      setQueries(prev => {
        const newEntry: Query = { query: queryText, result: null, error: err.message || 'Error' };
        return [...prev, newEntry];
      });
      setSelectedIndex(queries.length);
    }
  };

  const selectQuery = (index: number) => {
    if (index >= 0 && index < queries.length) {
      setSelectedIndex(index);
    }
  };

  return (
    <QueryContext.Provider value={{ queries, runQuery, selectedIndex, selectQuery }}>
      {children}
    </QueryContext.Provider>
  );
}