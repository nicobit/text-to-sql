import React from 'react';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

import Tooltip from '@mui/material/Tooltip';
import HelpIcon from '@mui/icons-material/Help';
import IconButton from '@mui/material/IconButton';


interface ContentTitleProps {
    title: string;
    onHelpClick?: () => void; // Add this prop
}

const ContentTitle: React.FC<ContentTitleProps> = ({ title, onHelpClick = undefined }) => {
    //const theme = useTheme();

    //const light_bg_color = 'rgba(240, 240, 240, 0.91)';
    //const dark_bg_color = 'rgba(0, 0, 0, 0.7)';

    //const content_bgColor = theme.palette.mode === 'dark' ? dark_bg_color : light_bg_color;

    //const light_color = 'rgba(240, 240, 240, 0.91)';
    //const dark_color = 'rgba(0, 0, 0, 0.7)';

    //const content_color = theme.palette.mode === 'dark' ? light_color : dark_color;

    return (
        <AppBar
            component="div"
            color="primary"
            position="static"
            elevation={0}
            sx={{
                zIndex: 0,
            }}
        >
            <Toolbar>
                <Grid container spacing={1} sx={{ alignItems: 'center' }}>
                    <Grid item xs>
                        <Typography color="inherit" variant="h5" component="h1">
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
                            <IconButton color="inherit" onClick={onHelpClick}>
                                <HelpIcon />
                            </IconButton>
                        </Tooltip>
                    </Grid>
                </Grid>
            </Toolbar>
        </AppBar>
    );
};

// Removed defaultProps as it's no longer supported for functional components

export default ContentTitle;
