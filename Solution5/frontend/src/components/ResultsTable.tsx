import { useContext, useState } from 'react';
import { QueryContext } from '../context/QueryContext';
import { Button, Table, Paper, TableHead, TableRow, TableCell, TableBody, Typography } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CodeIcon from '@mui/icons-material/Code';
import { Box} from '@mui/material';

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
  const data: QueryResult[] | null =
    currentEntry && currentEntry.result && Array.isArray(currentEntry.result) ? currentEntry.result : null;
  const error: string | null = currentEntry && currentEntry.error ? currentEntry.error : null;

  if (error) {
    return <Typography color="error" sx={{ mt: 2 }}>Error: {error}</Typography>;
  }

  const sqlQuery = currentEntry?.sql_query || 'No SQL query available';

  if (!data || data.length === 0) {
    return <> <Typography sx={{ mt: 2 }}>No results to display.</Typography>    <Paper sx={{ p: 2, backgroundColor: '#f5f5f5', mb: 2 }}>
    <Typography 
      variant="body2" 
      component="pre" 
      sx={{ 
        whiteSpace: 'pre-wrap', 
        wordBreak: 'break-word', 
        fontFamily: 'monospace' 
      }}
    >
      {sqlQuery}
    </Typography>
  </Paper> </>
  }

  // Determine table columns from keys of the first object
  const columns = Object.keys(data[0]);

  const [showSql, setShowSql] = useState(false);

  const handleToggleSql = () => {
    setShowSql(prev => !prev);
  };

  

  return (
    <>
      <div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
          <Button
            variant="outlined"
            startIcon={<ContentCopyIcon />}
            onClick={() => {
              const header = columns.join('\t'); // Join column names with tabs
              const text = data.map(row => columns.map(col => row[col]).join('\t')).join('\n');
              const clipboardText = `${header}\n${text}`; // Include the header in the copied text
              navigator.clipboard.writeText(clipboardText);
              ;
            }}
            style={{ marginRight: '8px' }}
          >
            Copy to Clipboard
          </Button>
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
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
            style={{ marginRight: '8px' }}
          >
            Download as Excel
          </Button>
          <Button
            variant="outlined"
            startIcon={<CodeIcon />}
            onClick={handleToggleSql}
          >
            {showSql ? 'Hide SQL Query' : 'Show SQL Query'}
          </Button>
        </div>

        {showSql && (
          <Paper sx={{ p: 2, backgroundColor: '#f5f5f5', mb: 2 }}>
            <Typography 
              variant="body2" 
              component="pre" 
              sx={{ 
                whiteSpace: 'pre-wrap', 
                wordBreak: 'break-word', 
                fontFamily: 'monospace' 
              }}
            >
              {sqlQuery}
            </Typography>
          </Paper>
        )}
        <Box
          sx={{
            flexGrow: 1,
            mb: 2,
           
            maxHeight: '60vh' , // Set a maximum height for the table container
            overflowX: 'auto', // Enable horizontal scrolling
            overflowY: 'auto', // Enable vertical scrolling
          }}
        >
          <Table sx={{ mt: 2 }} size="small" stickyHeader>
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
        </Box>
      </div>
    </>
  );
}

export default ResultsTable;
