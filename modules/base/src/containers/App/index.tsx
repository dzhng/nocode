import { Typography, Box, Skeleton } from '@mui/material';
import SheetContainer from '~/containers/Sheet';
import useApp from '~/hooks/useApp';

export default function App({ appId }: { appId: number }) {
  const app = useApp(appId);

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          paddingLeft: 2,
          borderBottom: (theme) => theme.dividerBorder,
          height: (theme) => theme.headerBarHeight + 1,
        }}
      >
        <Typography variant="h1">{app ? app.name : <Skeleton width={120} />}</Typography>
      </Box>

      <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
        <SheetContainer appId={appId} />
      </Box>
    </Box>
  );
}
