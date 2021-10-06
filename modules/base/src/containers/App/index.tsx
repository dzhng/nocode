import { useState } from 'react';
import {
  styled,
  Typography,
  Box,
  Skeleton,
  Button,
  IconButton,
  Tooltip,
  Divider,
  Select,
  MenuItem,
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Search as SearchIcon,
  ImportExport as SortIcon,
  PeopleAlt as PermissionIcon,
  Share as ShareIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
  TableRows as GridIcon,
  Apps as CardIcon,
  ViewAgendaOutlined as GroupIcon,
  Height as RowHeightIcon,
} from '@mui/icons-material';
import { AddIcon } from '~/components/Icons';
import SheetContainer from '~/containers/Sheet';
import useApp from '~/hooks/useApp';

export type ViewType = 'grid' | 'card';
export type HeightType = 'dynamic' | 'short' | 'tall';

const ToolbarButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(0.5),
  marginRight: theme.spacing(0.5),
  borderRadius: 5,
  display: 'flex',
  alignItems: 'center',
  fontSize: '0.7rem',
  '& svg': { marginRight: 3, width: 15, height: 15 },
}));

const ViewMenuItem = styled(MenuItem)(({ theme }) => ({
  fontSize: '0.7rem',
  '& svg': { width: 15, height: 15, marginRight: theme.spacing(0.5), marginTop: '-3px' },
}));

const ViewMenuSelect = styled(Select)(({ theme }) => ({
  marginLeft: theme.spacing(1),
  fontSize: '0.7rem',

  '& div[role=button]': {
    padding: theme.spacing(0.5),
    fontSize: '0.7rem',
    paddingRight: '25px !important',
    '&>svg': {
      height: 15,
      width: 15,
      marginRight: theme.spacing(0.5),
      marginLeft: theme.spacing(0.5),
      marginBottom: '-3px',
    },
  },
  '&>svg': { height: 15, width: 15, top: 'calc(50% - 8px)' },
}));

export default function App({ appId }: { appId: number }) {
  const app = useApp(appId);
  const [viewSetting, setViewSetting] = useState<ViewType>('grid');
  const [heightSetting, setHeightSetting] = useState<HeightType>('dynamic');

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
          paddingRight: 1,
          borderBottom: (theme) => theme.dividerBorder,
          height: (theme) => theme.headerBarHeight + 1,
        }}
      >
        <Typography variant="h1">{app ? app.name : <Skeleton width={120} />}</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'row' }}>
          <Tooltip title="History">
            <IconButton>
              <HistoryIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Settings">
            <IconButton sx={{ mr: 2 }}>
              <SettingsIcon />
            </IconButton>
          </Tooltip>
          <ToolbarButton
            sx={{ padding: 1, '& svg': { marginBottom: '1px' } }}
            variant="outlined"
            color="secondary"
          >
            <ShareIcon />
            Share
          </ToolbarButton>
        </Box>
      </Box>

      <Box
        sx={{
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingLeft: 2,
          paddingRight: 1,
          borderBottom: (theme) => theme.dividerBorder,
          color: (theme) => theme.palette.grey[800],
          height: 40,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', flexGrow: 1 }}>
          <ToolbarButton sx={{ pl: 1, pr: 1 }} color="primary" variant="contained">
            <AddIcon sx={{ mb: '2px' }} />
            New Record
          </ToolbarButton>

          <Divider sx={{ mr: 1, ml: 1 }} orientation="vertical" flexItem />

          <ToolbarButton color="inherit">
            <PermissionIcon />
            Permissions
          </ToolbarButton>

          <Divider sx={{ mr: 1, ml: 1 }} orientation="vertical" flexItem />

          <ToolbarButton color="inherit">
            <FilterIcon />
            Filter
          </ToolbarButton>
          <ToolbarButton color="inherit">
            <SortIcon />
            Sort
          </ToolbarButton>
          <ToolbarButton color="inherit">
            <GroupIcon />
            Group
          </ToolbarButton>

          <Divider sx={{ mr: 1, ml: 1 }} orientation="vertical" flexItem />

          <ViewMenuSelect
            sx={{ width: 110 }}
            value={viewSetting}
            onChange={(e) => setViewSetting(e.target.value as any)}
          >
            <ViewMenuItem value="grid">
              <GridIcon />
              Grid View
            </ViewMenuItem>
            <ViewMenuItem value="card">
              <CardIcon />
              Card View
            </ViewMenuItem>
          </ViewMenuSelect>
          <ViewMenuSelect
            sx={{ width: 100 }}
            value={heightSetting}
            onChange={(e) => setHeightSetting(e.target.value as any)}
          >
            <ViewMenuItem value="dynamic">
              <RowHeightIcon />
              Dynamic
            </ViewMenuItem>
            <ViewMenuItem value="short">
              <RowHeightIcon />
              Compact
            </ViewMenuItem>
            <ViewMenuItem value="tall">
              <RowHeightIcon />
              Tall
            </ViewMenuItem>
          </ViewMenuSelect>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'row' }}>
          <ToolbarButton color="inherit">
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
