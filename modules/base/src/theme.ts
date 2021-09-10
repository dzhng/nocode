import { createTheme } from '@material-ui/core';
import { CSSProperties } from '@material-ui/core/styles/withStyles';

declare module '@material-ui/core/styles/createTheme' {
  interface Theme {
    headerBarHeight: number;
    transitionTime: string;
    dividerBorder: string;

    customMixins: {
      modalPaper: CSSProperties;
      activitiesBar: CSSProperties;
      activitiesBarMini: CSSProperties;
      scrollBar: CSSProperties;
      disableScrollBar: CSSProperties;
      overflowScrollGradient: CSSProperties;
    };
  }

  // allow configuration using `createTheme`
  interface ThemeOptions {
    headerBarHeight?: number;
    transitionTime?: string;
    dividerBorder?: string;

    customMixins: {
      modalPaper?: CSSProperties;
      scrollBar?: CSSProperties;
      disableScrollBar?: CSSProperties;
      overflowScrollGradient?: CSSProperties;
    };
  }
}

// colors:
// Primary is for main actions
// Secondary is for host or moderation related actions

export default createTheme({
  shape: {
    borderRadius: 6,
  },
  palette: {
    type: 'light',
  },
  typography: {
    // for hero text
    h1: {
      fontSize: '1.4rem',
      fontWeight: 400,
    },
    // main navigation title
    h2: {
      fontSize: '1.1rem',
      fontWeight: 400,
    },
    // navigation item text
    h3: {
      fontSize: '1.0rem',
      fontWeight: 400,
    },
    // navigation item text (small)
    h4: {
      fontSize: '0.95rem',
      fontWeight: 400,
    },
    // section labels
    h5: {
      fontSize: '0.9rem',
      fontWeight: 400,
    },
    // section labels (small)
    h6: {
      fontSize: '0.9rem',
      fontWeight: 300,
    },
    // main body / selection text
    body1: {
      fontSize: '0.9rem',
      fontWeight: 400,
    },
    // descriptions
    body2: {
      fontSize: '0.8rem',
      fontWeight: 400,
    },
    button: {
      fontSize: '0.8rem',
    },
  },
  overrides: {
    MuiTooltip: {
      arrow: {
        backgroundColor: 'black',
      },
      tooltip: {
        backgroundColor: 'black',
      },
    },
  },
  // reduce z-index for everything so libs like nprogress will still work (nprogress is 1031)
  zIndex: {
    mobileStepper: 100,
    speedDial: 105,
    appBar: 110,
    drawer: 120,
    modal: 130,
    snackbar: 140,
    tooltip: 150,
  },

  // custom
  headerBarHeight: 64,
  transitionTime: '0.3s',
  dividerBorder: '1px solid rgba(0, 0, 0, 0.12)',

  customMixins: {
    modalPaper: {
      width: '90%',
      maxWidth: 600,
    },
    scrollBar: {
      // scroll bar customization
      '&::-webkit-scrollbar': {
        width: 8,
      },
      '&::-webkit-scrollbar-track': {
        background: 'none',
      },
      '&::-webkit-scrollbar-thumb': {
        borderRadius: 4,
        background: 'rgba(0,0,0,0.2)',
      },
      '&::-webkit-scrollbar-thumb:hover': {
        background: 'rgba(0,0,0,0.4)',
      },
    },
    disableScrollBar: {
      // Hide scrollbar for Chrome, Safari and Opera
      '&::-webkit-scrollbar': {
        display: 'none',
      },
      // Hide scrollbar for IE, Edge and Firefox
      msOverflowStyle: 'none', // IE and Edge
      scrollbarWidth: 'none', // Firefox
    },
    overflowScrollGradient: {
      position: 'relative',

      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        width: '100%',
        height: 25,
        // transparent keyword is broken in Safari
        background: 'linear-gradient(white, rgba(255, 255, 255, 0.001))',
      },
      '&::after': {
        content: '""',
        position: 'absolute',
        bottom: 0,
        width: '100%',
        height: 25,
        background: 'linear-gradient(rgba(255, 255, 255, 0.001), white)',
      },
    },
  },
});
