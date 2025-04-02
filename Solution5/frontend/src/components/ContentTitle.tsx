import React from 'react';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

import Tooltip from '@mui/material/Tooltip';
import HelpIcon from '@mui/icons-material/Help';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';



interface ContentTitleProps {
    title: string;
}

const ContentTitle: React.FC<ContentTitleProps> = ({ title }) => {

 

    const theme = useTheme();
    

    const light_bg_color = 'rgba(240, 240, 240, 0.91)';
    const dark_bg_color = 'rgba(0, 0, 0, 0.7)';

    const content_bgColor = theme.palette.mode === 'dark' ?  dark_bg_color: light_bg_color;


    
    const light_color = 'rgba(240, 240, 240, 0.91)';
    const dark_color = 'rgba(0, 0, 0, 0.7)';

    const content_color = theme.palette.mode === 'dark' ?  light_color: dark_color;

    return (
       
            <AppBar
                component="div"
                color="primary"
                position="static"
                elevation={0}
                sx={{
                    zIndex: 0,
                    bgcolor: content_bgColor,
                    borderBottom: '1px solid #ddd',
                    color: content_color,
                }}
            >
                <Toolbar>
                    <Grid container spacing={1} sx={{ alignItems: 'center' }}>
                        <Grid item xs>
                            <Typography color="inherit" variant="h6" component="h6">
                                {title}
                            </Typography>
                        </Grid>
                        <Grid item>
                            <Button
                                sx={{ borderColor: 'inherit' }}
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
      
    );
};

export default ContentTitle;
