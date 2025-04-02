import React, { useEffect, useState } from 'react';
import * as monaco from 'monaco-editor';
import { IPublicClientApplication } from "@azure/msal-browser";
import MonacoEditor from 'react-monaco-editor';
import {
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  
  Box,
  SelectChangeEvent,
  LinearProgress
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import {
  getDatabases,
  getExamples,
  deleteExample,
  updateExample,
  addExample,
  IExample
} from '../api/example';

interface ExamplesManagerProps {
  msalInstance: IPublicClientApplication;
}

const QuestionQueryExample: React.FC<ExamplesManagerProps> = ({ msalInstance }) => {
  const [databases, setDatabases] = useState<string[]>([]);
  const [selectedDatabase, setSelectedDatabase] = useState<string>('default');
  const [examples, setExamples] = useState<IExample[]>([]);
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [createDialogOpen, setCreateDialogOpen] = useState<boolean>(false);
  const [currentExample, setCurrentExample] = useState<IExample>({
    doc_id: '',
    question: '',
    sql: '',
    sql_embedding: []
  });
  const [newExample, setNewExample] = useState<IExample>({
    doc_id: '',
    question: '',
    sql: '',
    sql_embedding: []
  });
  const [loading, setLoading] = useState<boolean>(false); // Loading state

  useEffect(() => {

    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    });
   
  }, []);

  useEffect(() => {
    setLoading(true); // Start loading
    getDatabases(msalInstance)
      .then((dbs: string[]) => {
        setDatabases(dbs);
        if (dbs.length > 0) {
          setSelectedDatabase(dbs[0]);
        }
      })
      .catch((err: unknown) => {
        console.error("Comp. Error fetching databases:", err);
        enqueueSnackbar("Error fetching databases: " + (err as Error).message, { variant: 'error' });
      })
      .finally(() => setLoading(false)); // Stop loading
  }, [msalInstance]);

  useEffect(() => {
    if (selectedDatabase && selectedDatabase !== 'default' && selectedDatabase !== '') {
      setLoading(true); // Start loading
      getExamples(msalInstance, selectedDatabase)
        .then((exs: IExample[]) => setExamples(exs))
        .catch((err: unknown) => {
          console.error("Comp. Error fetching examples:", err);
          enqueueSnackbar("Error fetching examples: " + (err as Error).message, { variant: 'error' });
        })
        .finally(() => setLoading(false)); // Stop loading
    }
  }, [selectedDatabase, msalInstance]);

  const handleDatabaseChange = (event: SelectChangeEvent<string>) => {
    setSelectedDatabase(event.target.value as string);
  };

  const handleEditClick = (example: IExample) => {
    setCurrentExample(example);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (doc_id: string) => {
    if (window.confirm("Are you sure you want to delete this example?")) {
      setLoading(true); // Start loading
      deleteExample(msalInstance, doc_id, selectedDatabase)
        .then(() => {
          setExamples(prev => prev.filter(example => example.doc_id !== doc_id));
        })
        .catch((err: unknown) => {
          console.error("Comp. Error deleting example:", err);
          enqueueSnackbar("Error deleting example: " + (err as Error).message, { variant: 'error' });
        })
        .finally(() => setLoading(false)); // Stop loading
    }
  };

  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
  };

  const handleEditSave = () => {
    setLoading(true); // Start loading
    updateExample(msalInstance, currentExample.doc_id, currentExample.question, currentExample.sql, selectedDatabase)
      .then(() => {
        setExamples(prev =>
          prev.map(example =>
            example.doc_id === currentExample.doc_id ? currentExample : example
          )
        );
        setEditDialogOpen(false);
      })
      .catch((err: unknown) => {
        console.error("Comp. Error updating example:", err);
        enqueueSnackbar("Error updating example: " + (err as Error).message, { variant: 'error' });
      })
      .finally(() => setLoading(false)); // Stop loading
  };

  const handleFieldChange = (field: keyof IExample, value: string) => {
    setCurrentExample(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateDialogOpen = () => {
    setNewExample({ doc_id: '', question: '', sql: '', sql_embedding: [] });
    setCreateDialogOpen(true);
  };

  const handleCreateDialogClose = () => {
    setCreateDialogOpen(false);
  };

  const handleCreateSave = () => {
    setLoading(true); // Start loading
    addExample(msalInstance, newExample.question, newExample.sql, selectedDatabase)
      .then(() => {
        setExamples(prev => [...prev, newExample]);
        setCreateDialogOpen(false);
      })
      .catch((err: unknown) => {
        console.error("Comp. adding new example", err);
        enqueueSnackbar("Error adding new example: " + (err as Error).message, { variant: 'error' });
      })
      .finally(() => setLoading(false)); // Stop loading
  };

  const handleNewFieldChange = (field: keyof IExample, value: string) => {
    setNewExample(prev => ({ ...prev, [field]: value }));
  };

  

  return (
    <Box sx={{ padding: 2 }}>
      {loading && <LinearProgress sx={{ height: 5 }} />} {/* Show LinearProgress with height 5 pixels when loading */}
      {!loading && <div style={{ height: '5px' }} />}
      
      <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2, marginTop: 2 }}>
      <FormControl variant="outlined" sx={{ minWidth: 200, marginRight: 2 }}>
        <InputLabel id="database-select-label">Database</InputLabel>
        <Select
        labelId="database-select-label"
        value={selectedDatabase}
        onChange={handleDatabaseChange}
        label="Database"
        >
        {databases.map((db, idx) => (
          <MenuItem key={idx} value={db}>
          {db}
          </MenuItem>
        ))}
        </Select>
      </FormControl>
      <Button variant="contained" color="primary" onClick={handleCreateDialogOpen}>
        Create New
      </Button>
      </Box>
    
      <TableContainer component={Paper} sx={{ marginBottom: 2 }}>
      <Table aria-label="examples table">
        <TableHead>
        <TableRow>
          <TableCell>Question</TableCell>
          <TableCell>SQL</TableCell>
          <TableCell align="right">Actions</TableCell>
        </TableRow>
        </TableHead>
        <TableBody>
        {examples.map((example) => (
          <TableRow key={example.doc_id}>
          <TableCell>{example.question}</TableCell>
          <TableCell>{example.sql}</TableCell>
          <TableCell align="right">
            <Button
            variant="contained"
            color="primary"
            onClick={() => handleEditClick(example)}
            sx={{ marginRight: 1 }}
            >
            Edit
            </Button>
            <Button
            variant="contained"
            color="secondary"
            onClick={() => handleDeleteClick(example.doc_id)}
            >
            Delete
            </Button>
          </TableCell>
          </TableRow>
        ))}
        </TableBody>
      </Table>
      </TableContainer>

      {/* Edit Example Dialog */}
      <Dialog open={editDialogOpen} onClose={handleEditDialogClose}  PaperProps={{
          style: {
            width: '70vw', // 70% of viewport width
            height: '70vh', // 70% of viewport height
            maxWidth: '70vw', // Prevent from growing too wide
          },
        }} >
      <DialogTitle>Edit Example</DialogTitle>
      <DialogContent sx={{display: 'flex', flexDirection: 'column' }}>
        <TextField
          margin="dense"
          label="Question"
          fullWidth
          variant="outlined"
          value={currentExample.question}
          onChange={(e) => handleFieldChange('question', e.target.value)}
        />
        <Box sx={{ marginTop: 2 }}>
          <InputLabel>SQL</InputLabel>
          <MonacoEditor
          width="100%"
        height="calc(80vh - 350px)"
        language="sql"
        theme="vs-dark"
        value={currentExample.sql}
        options={{
          selectOnLineNumbers: true,
          automaticLayout: true,
          minimap: { enabled: false },
        }}
        onChange={(value) => handleFieldChange('sql', value || '')}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleEditDialogClose} color="secondary">
        Cancel
        </Button>
        <Button onClick={handleEditSave} color="primary">
        Save
        </Button>
      </DialogActions>
      </Dialog>

      {/* Create New Example Dialog */}
      <Dialog open={createDialogOpen} onClose={handleCreateDialogClose}  PaperProps={{
          style: {
            width: '70vw', // 70% of viewport width
            height: '70vh', // 70% of viewport height
            maxWidth: '70vw', // Prevent from growing too wide
          },
        }} >
      <DialogTitle>Create New Example</DialogTitle>
      <DialogContent sx={{  display: 'flex' , flexDirection: 'column' }}>
        <TextField
        margin="dense"
        label="Question"
        fullWidth
        variant="outlined"
        value={newExample.question}
        onChange={(e) => handleNewFieldChange('question', e.target.value)}
        />
         <Box sx={{ marginTop: 2 }}>
         <InputLabel>SQL</InputLabel>
          <MonacoEditor
        width="100%"
        height="calc(80vh - 350px)"
        language="sql"
        theme="vs-dark"
        value={newExample.sql}
        options={{
          selectOnLineNumbers: true,
          automaticLayout: true,
          minimap: { enabled: false },
        }}
        onChange={(value) => handleNewFieldChange('sql', value || '')}
          />
      </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCreateDialogClose} color="secondary">
        Cancel
        </Button>
        <Button onClick={handleCreateSave} color="primary">
        Save
        </Button>
      </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QuestionQueryExample;
