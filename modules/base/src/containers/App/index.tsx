import { styled, Typography, Box, Skeleton, Button } from '@mui/material';
import {
  FilterList as FilterIcon,
  Search as SearchIcon,
  ImportExport as SortIcon,
} from '@mui/icons-material';
import SheetContainer from '~/containers/Sheet';
import useApp from '~/hooks/useApp';

const ToolbarButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1),
  marginRight: theme.spacing(1),
  borderRadius: 5,
  display: 'flex',
  alignItems: 'center',
  '&:hover': { backgroundColor: theme.hoverColor },
  '& svg': { marginRight: 3 },
}));

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
          justifyContent: 'space-between',
          paddingLeft: 2,
          borderBottom: (theme) => theme.dividerBorder,
          height: (theme) => theme.headerBarHeight + 1,
        }}
      >
        <Typography variant="h1">{app ? app.name : <Skeleton width={120} />}</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'row' }}>
          <ToolbarButton>
            <FilterIcon />
            Filter
          </ToolbarButton>
          <ToolbarButton>
            <SortIcon />
            Sort
          </ToolbarButton>
          <ToolbarButton>
            <SearchIcon />
            Find
          </ToolbarButton>
        </Box>
      </Box>

      <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
        <SheetContainer appId={appId} />
      </Box>
    </Box>
  );
}
