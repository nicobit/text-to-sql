import { createContext, useState, ReactNode } from 'react';
import { submitQuery } from '../api/api';
import { useAuth } from './AuthContext';
import { useMsal } from "@azure/msal-react";


interface Query {
  query: string;
  result: any;
  answer:string;
  chartType:string;
  error: string | null;
  sql_query?: string;
  execution_history?: [];
  mermaid?: string;
  isExpanded?: boolean; // Added property to track expansion state
  reasoning?: string; // Added property for reasoning
  isReasoningExpanded?: boolean; // Added this property
}

interface QueryContextType {  
  queries: Query[];
  runQuery: (queryText: string) => Promise<void>;
  selectedIndex: number | null;
  selectQuery: (index: number) => void;
  setQueries: (queries: Query[]) => void; // Add setQueries function
  
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
        const newEntry: Query = {sql_query:  resultData.sql_query, 
          query: queryText, 
          result: resultData.results,
          answer:resultData.answer,
           chartType:resultData.chart_type, 
           error: null, 
           execution_history: resultData.execution_history, 
           reasoning: resultData.reasoning,
           mermaid : resultData.mermaid};
        return [...prev, newEntry];
      });
      setSelectedIndex(queries.length);
    } catch (err: any) {
      setQueries(prev => {
        const newEntry: Query = { query: queryText, result: null, answer:"", chartType:"", error: err.message || 'Error' };
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
    <QueryContext.Provider value={{ queries, runQuery, selectedIndex, selectQuery , setQueries}}>
      {children}
    </QueryContext.Provider>
  );
}