import React, { useContext } from 'react';
import { QueryContext } from '../context/QueryContext';
import { Table, TableHead, TableRow, TableCell, TableBody, Typography } from '@mui/material';

interface QueryResult {
  [key: string]: any;
}

function ResultsTable() {
  const queryContext = useContext(QueryContext);
    
    if (!queryContext) {
      return <div>Loading...</div>;
    }
      
  const { queries, selectedIndex } = queryContext;
  const currentEntry = (selectedIndex !== null && selectedIndex < queries.length) ? queries[selectedIndex] : null;
  const data: QueryResult[] | null = currentEntry && currentEntry.result && Array.isArray(currentEntry.result) ? currentEntry.result : null;
  const error: string | null = currentEntry && currentEntry.error ? currentEntry.error : null;

  if (error) {
    return <Typography color="error" sx={{ mt: 2 }}>Error: {error}</Typography>;
  }

  if (!data || data.length === 0) {
    return <Typography sx={{ mt: 2 }}>No results to display.</Typography>;
  }

  // Determine table columns from keys of the first object
  const columns = Object.keys(data[0]);

  return (
    <Table sx={{ mt: 2 }} size="small">
      <TableHead>
        <TableRow>
          {columns.map(col => (
            <TableCell key={col}><strong>{col}</strong></TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map((row, idx) => (
          <TableRow key={idx}>
            {columns.map(col => (
              <TableCell key={col + idx}>
                {row[col] !== undefined ? String(row[col]) : ''}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default ResultsTable;