import { useContext, useState } from 'react';
import { QueryContext } from '../context/QueryContext';
import { Box, Typography, Paper } from '@mui/material';
import MermaidDiagram from './MermaidDiagram';
import MonacoEditor from 'react-monaco-editor';

function ResultsTable() {
  const queryContext = useContext(QueryContext);

  if (!queryContext) {
    return <div>Loading...</div>;
  }

  const { queries, selectedIndex } = queryContext;
  const currentEntry = (selectedIndex !== null && selectedIndex < queries.length) ? queries[selectedIndex] : null;
  const mermaidContent = currentEntry?.mermaid || 'No Mermaid diagram available';

  const [mermaidText, setMermaidText] = useState(mermaidContent);

  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, mt: 2,   padding: 2, position: 'relative' }}>
     
      {/* Text Box */}
      <Paper sx={{ flex: 1, p: 2, backgroundColor: '#f5f5f5', width:'40%'  }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Edit Mermaid Code
        </Typography>
        <div style={{ border: '1px solid #ccc', overflow: 'auto', height: '92%' }}>
          <MonacoEditor
            language="markdown"
            value={mermaidText}
            onChange={(value) => setMermaidText(value || '')}
            options={{
              fontFamily: 'monospace',
              fontSize: 14,
              minimap: { enabled: false },
              automaticLayout: true,
            }}
          />
        </div>
      </Paper>
       {/* Mermaid Diagram */}
       <Paper sx={{  flex: 1, p: 2, backgroundColor: '#f5f5f5' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Mermaid Diagram
        </Typography>
        <MermaidDiagram sx={{height:'92%'}} chart={mermaidText} />
      </Paper>

    </Box>
  );
}

export default ResultsTable;
