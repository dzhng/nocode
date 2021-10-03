import { PropsWithChildren } from 'react';
import { Box } from '@mui/material';
import useGlobalState from '~/hooks/useGlobalState';
import Nav from '~/components/Nav';

export default function AppLayoutContainer({ children }: PropsWithChildren<any>) {
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
      {children}
    </Box>
  );
}
