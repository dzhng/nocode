import { Box } from '@mui/material';
import useGlobalState from '~/hooks/useGlobalState';
import Nav from '~/components/Nav';
import App from './App';

export default function AppContainer({ appId }: { appId: number }) {
  const { isNavOpen, setIsNavOpen } = useGlobalState();
  return (
    <Box
      sx={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
      }}
    >
      <Nav isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />
      <App appId={appId} />
    </Box>
  );
}
