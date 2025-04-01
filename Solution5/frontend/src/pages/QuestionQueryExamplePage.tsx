

import ExampleManager from '../components/QuestionQueryExample';
import { useMsal } from '@azure/msal-react'; // Assuming you're using MSAL React
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

import Tooltip from '@mui/material/Tooltip';
import HelpIcon from '@mui/icons-material/Help';
import IconButton from '@mui/material/IconButton';

const lightColor = 'rgba(255, 255, 255, 0.7)';

const QuestionQueryExamplePage: React.FC = () => {
    const { instance: msalInstance } = useMsal(); // Get the msalInstance

  
    return (
        <div style={{ height: '88vh', overflow: 'hidden' }}>
          <AppBar
        component="div"
        color="primary"
        
        position="static"
        
        elevation={0}
        sx={{ zIndex: 0, bgcolor: 'rgba(240, 240, 240, 0.91)', borderBottom: '1px solid #ddd' , color: 'rgba(65, 65, 65, 0.91)'}}
      >

        <Toolbar>
          <Grid container spacing={1} sx={{ alignItems: 'center' }}>
            <Grid item xs>
              <Typography color="inherit" variant="h6" component="h6">
                Question / SQL Query Examples
              </Typography>
            </Grid>
            <Grid item>
              <Button
                sx={{ borderColor: lightColor }}
                variant="outlined"
                color="inherit"
                size="small"
              >
                Web setup
              </Button>
            </Grid>
            <Grid item>
              <Tooltip title="Help">
                <IconButton color="inherit">
                  <HelpIcon />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
          <ExampleManager msalInstance={msalInstance} />
       
      </div>
    );
};

export default QuestionQueryExamplePage;
