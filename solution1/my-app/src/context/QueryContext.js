import React, { createContext, useState, useContext } from 'react';
import { submitQuery } from '../api/api';
import { useAuth  } from './AuthContext';
import { useIsAuthenticated,useMsal  } from "@azure/msal-react";

export const QueryContext = createContext(null);

export function QueryProvider({ children }) {
  const [queries, setQueries] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  // Access auth context (for example, to ensure user is authenticated)
  const { user, login, logout, isAuthenticated } = useAuth();
  //const isAuthenticated = useIsAuthenticated();

  const runQuery = async (queryText) => {
    if (!isAuthenticated) {
      console.warn('User not authenticated');
      return;
    }
    try {
      const resultData = await submitQuery(queryText);
      // Add new query result to history
      setQueries(prev => {
        const newEntry = { query: queryText, result: resultData.results, error: null };
        return [...prev, newEntry];
      });
      // Select the newly added query (last index)
      setSelectedIndex(queries.length);
    } catch (err) {
      // Add entry with error message
      setQueries(prev => {
        const newEntry = { query: queryText, result: null, error: err.message || 'Error' };
        return [...prev, newEntry];
      });
      setSelectedIndex(queries.length);
    }
  };

  const selectQuery = (index) => {
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