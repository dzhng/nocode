import { useState, useEffect } from 'react';
import type { AppProps } from 'next/app';
import Router from 'next/router';
import { CssBaseline } from '@material-ui/core';
import { MuiThemeProvider } from '@material-ui/core/styles';
import { SnackbarProvider } from 'notistack';

import '~/utils/progress-indicator';
import theme from '~/theme';
import Head from '~/components/App/Head';
import ErrorDialog from '~/components/ErrorDialog';
import { AppStateProvider } from '~/hooks/useAppState';

import './styles.css';

export default function App({ Component, pageProps }: AppProps) {
  const [previousPage, setPreviousPage] = useState<string | undefined>();

  useEffect(() => {
    const handleChange = (url: string) => {
      setPreviousPage(url);
    };
    Router.events.on('beforeHistoryChange', handleChange);
    return Router.events.off('beforeHistoryChange', handleChange);
  }, []);

  return (
    <MuiThemeProvider theme={theme}>
      <SnackbarProvider
        maxSnack={3}
        autoHideDuration={3000}
        anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
        variant="info"
      >
        <AppStateProvider>
          <Head />
          <CssBaseline />
          <ErrorDialog />
          <Component previousPage={previousPage} {...pageProps} />
        </AppStateProvider>
      </SnackbarProvider>
    </MuiThemeProvider>
  );
}
