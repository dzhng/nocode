import { PropsWithChildren, ReactNode, useCallback } from 'react';
import { Box } from '@mui/material';
import useGlobalState from '~/hooks/useGlobalState';
import Nav from '~/components/Nav';

export default function AppLayoutContainer({ children }: PropsWithChildren<any>) {
  const { isNavOpen, setIsNavOpen } = useGlobalState();

  const handleClose = useCallback(() => {
    setIsNavOpen(false);
  }, [setIsNavOpen]);

  return (
    <Box
      sx={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
      }}
    >
      <Nav isOpen={isNavOpen} onClose={handleClose} />
      {children}
    </Box>
  );
}

export const getLayout = (page: ReactNode) => <AppLayoutContainer>{page}</AppLayoutContainer>;
