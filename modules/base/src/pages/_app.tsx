import { useState, useEffect } from 'react';
import type { AppProps } from 'next/app';
import Router from 'next/router';
import { withTRPC } from '@trpc/next';
import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { CacheProvider, EmotionCache } from '@emotion/react';
import { SnackbarProvider } from 'notistack';

import type { AppRouter } from '~/pages/api/trpc/[trpc]';
import { transformer } from '~/utils/trpc';
import { createEmotionCache } from '~/utils/emotion';
import '~/utils/progress-indicator';
import theme from '~/theme';
import Head from '~/components/App/Head';
import ErrorDialog from '~/components/ErrorDialog';
import { GlobalStateProvider } from '~/hooks/useGlobalState';

import './styles.css';

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
}

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

function App({ Component, pageProps, emotionCache = clientSideEmotionCache }: MyAppProps) {
  const [previousPage, setPreviousPage] = useState<string | undefined>();

  useEffect(() => {
    const handleChange = (url: string) => {
      setPreviousPage(url);
    };
    Router.events.on('beforeHistoryChange', handleChange);
    return Router.events.off('beforeHistoryChange', handleChange);
  }, []);

  return (
    <CacheProvider value={emotionCache}>
      <ThemeProvider theme={theme}>
        <SnackbarProvider
          maxSnack={3}
          autoHideDuration={3000}
          anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
          variant="info"
        >
          <GlobalStateProvider>
            <Head />
            <CssBaseline />
            <ErrorDialog />
            <Component previousPage={previousPage} {...pageProps} />
          </GlobalStateProvider>
        </SnackbarProvider>
      </ThemeProvider>
    </CacheProvider>
  );
}

export default withTRPC<AppRouter>({
  config() {
    return {
      url: '/api/trpc',
      transformer,
      /**
       * @link https://react-query.tanstack.com/reference/QueryClient
       */
      // queryClientConfig: { defaultOptions: { queries: { staleTime: 60 } } },
    };
  },
  ssr: false,
})(App);
