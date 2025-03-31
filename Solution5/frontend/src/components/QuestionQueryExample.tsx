import React, { useEffect, useState } from 'react';
import { IPublicClientApplication } from "@azure/msal-browser";
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
  Typography,
  Box,
  SelectChangeEvent
} from '@mui/material';
import {  enqueueSnackbar } from 'notistack';
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
  

  useEffect(() => {
    getDatabases(msalInstance)
      .then((dbs: string[]) => { 
          setDatabases(dbs) 
          if (dbs.length > 0) {
            setSelectedDatabase(dbs[0]);
          
          }
      })
      .catch((err: unknown) => {
        
        console.error("Comp. Error fetching databases:", err);
        enqueueSnackbar("Error fetching databases: " + (err as Error).message, { variant: 'error' });

      });
  }, [msalInstance]);

  useEffect(() => {
    if (selectedDatabase && selectedDatabase !== 'default' && selectedDatabase !== '') {
      getExamples(msalInstance, selectedDatabase)
        .then((exs: IExample[]) => setExamples(exs))
        .catch((err: unknown) => {
           // Assuming you have a toaster library like notistack
           console.error("Comp. Error fetching examples:", err);
          enqueueSnackbar("Error fetching examples: " + (err as Error).message, { variant: 'error' });
          console.error("Comp. Error fetching examples:", err)
        });
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
      deleteExample(msalInstance, doc_id, selectedDatabase)
        .then(() => {
          setExamples(prev => prev.filter(example => example.doc_id !== doc_id));
        })
        .catch((err: unknown) => {
          console.error("Comp. Error deleting example:", err);
          enqueueSnackbar("Error deleting example: " + (err as Error).message, { variant: 'error' });
        });
    }
  };
  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
  };

  const handleEditSave = () => {
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
        // Assuming you have a toaster library like notistack
        console.error("Comp. Error updating example:", err);
       enqueueSnackbar("Error updating example: " + (err as Error).message, { variant: 'error' });
       
     });
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
    addExample(msalInstance, newExample.question, newExample.sql, selectedDatabase)
      .then(() => {
      setExamples(prev => [...prev, newExample]);
      setCreateDialogOpen(false);
      })
      .catch((err: unknown) => {
        // Assuming you have a toaster library like notistack
        console.error("Comp. adding new example", err);
       enqueueSnackbar("Error adding new example: " + (err as Error).message, { variant: 'error' });
       
     });
      
  };

  const handleNewFieldChange = (field: keyof IExample, value: string) => {
    setNewExample(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h5" gutterBottom>
        Manage Examples
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
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
      <Dialog open={editDialogOpen} onClose={handleEditDialogClose}>
        <DialogTitle>Edit Example</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Question"
            fullWidth
            variant="outlined"
            value={currentExample.question}
            onChange={(e) => handleFieldChange('question', e.target.value)}
          />
          <TextField
            margin="dense"
            label="SQL"
            fullWidth
            variant="outlined"
            value={currentExample.sql}
            onChange={(e) => handleFieldChange('sql', e.target.value)}
          />
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
      <Dialog open={createDialogOpen} onClose={handleCreateDialogClose}>
        <DialogTitle>Create New Example</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Question"
            fullWidth
            variant="outlined"
            value={newExample.question}
            onChange={(e) => handleNewFieldChange('question', e.target.value)}
          />
          <TextField
            margin="dense"
            label="SQL"
            fullWidth
            variant="outlined"
            value={newExample.sql}
            onChange={(e) => handleNewFieldChange('sql', e.target.value)}
          />
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