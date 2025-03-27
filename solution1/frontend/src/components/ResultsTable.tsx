import { useContext } from 'react';
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
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
      <button
        onClick={() => {
        const text = data.map(row => columns.map(col => row[col]).join('\t')).join('\n');
        navigator.clipboard.writeText(text);
        }}
        style={{ marginRight: '8px' }}
      >
        Copy to Clipboard
      </button>
      <button
        onClick={() => {
        const rows = [columns, ...data.map(row => columns.map(col => row[col]))];
        const csvContent = rows.map(e => e.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'table_data.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        }}
      >
        Download as Excel
      </button>
      </div>
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
    </>
  );
}

export default ResultsTable;