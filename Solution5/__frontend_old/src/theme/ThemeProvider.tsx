import React, { createContext, useState, ReactNode, useContext } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';

const ThemeContext = createContext<any>(null);

export const useTheme = () => useContext(ThemeContext);

const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };


  let theme = createTheme({
    palette: {
      mode,
      primary: {
        light: '#63ccff',
        main: '#009be5',
        dark: '#006db3',
      },
      secondary: {
        light: '#ff4081',
        main: '#f50057',
        dark: '#ab003c',
      },
    },
    typography: {
      h5: {
        fontWeight: 500,
        fontSize: 26,
        letterSpacing: 0.5,
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiTab: {
        defaultProps: {
          disableRipple: true,
        },
      },
    },
    mixins: {
      toolbar: {
        minHeight: 48,
      },
    },
  });
  
  theme = {
    ...theme,
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 2, // Example: Set a custom border radius
          
            //padding: theme.spacing(2), // Example: Add padding
            paddingLeft: theme.spacing(2),
            paddingRight: theme.spacing(2),
            backgroundColor: mode === 'light' ? 'whitesmoke' : '#1e1e1e', // Example: Different background for light/dark mode
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: '#081627',
          },
        },
      },
      MuiCardContent: {
        styleOverrides: {
          root: {
            padding: theme.spacing(2),
            '&:last-child': {
              paddingBottom: 0 , //theme.spacing(2),
            },
          },
        }
      },
      MuiCardHeader: {
        styleOverrides: {
          root: {
            paddingBottom: theme.spacing(1),
            '& .MuiCardHeader-action': {
              marginTop: theme.spacing(0.5),
            },
            fontSize: 14,
          },
           /* NEW – applies only to the title node inside the header */
          title: {
              fontSize: 14,
              lineHeight: 1.4,                    // optional – pairs well with 14 px
              fontWeight: theme.typography.fontWeightMedium,
            },
        },
         // Removed invalid 'title' property. Apply styles via a custom class or directly in the component.
      },

      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
          },
          contained: {
            boxShadow: 'none',
            '&:active': {
              boxShadow: 'none',
            },
          },
        },
      },
      MuiTypography: {

        styleOverrides: {
          root: {
            marginLeft: theme.spacing(1),
            fontSize:'16px'
          }
          
        },
      },

      MuiTabs: {
        styleOverrides: {
          root: {
            marginLeft: theme.spacing(1),
          },
          indicator: {
            height: 3,
            borderTopLeftRadius: 3,
            borderTopRightRadius: 3,
            backgroundColor: theme.palette.common.white,
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            margin: '0 16px',
            minWidth: 0,
            padding: 0,
            [theme.breakpoints.up('md')]: {
              padding: 0,
              minWidth: 0,
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            padding: theme.spacing(1),
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            borderRadius: 4,
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            backgroundColor: 'rgb(255,255,255,0.15)',
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            '&.Mui-selected': {
              color: '#4fc3f7',
            },
          },
        },
      },
      MuiListItemText: {
        styleOverrides: {
          primary: {
            fontSize: 14,
            fontWeight: theme.typography.fontWeightMedium,
          },
        },
      },
      MuiListItemIcon: {
        styleOverrides: {
          root: {
            color: 'inherit',
            minWidth: 'auto',
            marginRight: theme.spacing(2),
            '& svg': {
              fontSize: 20,
            },
          },
        },
      },
      MuiAvatar: {
        styleOverrides: {
          root: {
            width: 32,
            height: 32,
          },
        },
      },
    },
  };

  return (
    <ThemeContext.Provider value={{ toggleTheme, mode }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;