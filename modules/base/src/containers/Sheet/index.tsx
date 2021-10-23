import { useState, useEffect, useCallback, MouseEvent } from 'react';
import { styled } from '@mui/styles';
import { Box, Skeleton } from '@mui/material';
import useSheets from '~/hooks/useSheets';
import DataTable from '~/components/DataTable';
import { useAppSelector } from '~/store';
import SheetPopover from './SheetPopover';

const TabHeight = 28;

const TableContainer = styled('div')(({ theme }) => ({
  flexGrow: 1,
  overflow: 'scroll',
  ...theme.customMixins.scrollBar,
}));

const Tab = styled('div')(({ theme }) => ({
  minWidth: 100,
  lineHeight: `${TabHeight}px`,
  textAlign: 'center',
  background: '#DDD',
  margin: '2px',
  borderRadius: theme.shape.borderRadius,
  flexShrink: 0,
  cursor: 'pointer',
  userSelect: 'none',
  paddingLeft: theme.spacing(1),
  paddingRight: theme.spacing(1),

  '&.selected': {
    background: '#CCC',
  },
}));

export default function SheetContainer({ appId }: { appId: number }) {
  const { sheets, createSheet, deleteSheet, updateSheetName, isLoadingSheets } = useSheets(appId);
  const [selectedSheetId, setSelectedSheetId] = useState<number | null>(null);
  const [deletingSheetId, setDeletingSheetId] = useState<number | null>(null);

  // for managing popover
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  const [popoverSheetId, setPopoverSheetId] = useState<number | null>(null);

  const selectedSheet = useAppSelector((state) =>
    selectedSheetId ? state.sheet.sheets[selectedSheetId] : null,
  );
  const popoverSheet = useAppSelector((state) =>
    popoverSheetId ? state.sheet.sheets[popoverSheetId] : null,
  );

  const showLoading = isLoadingSheets && sheets.length === 0;

  // select the first sheet once it loads if none is selected
  useEffect(() => {
    if (sheets.length > 0) {
      if (sheets.findIndex((s) => s.id === selectedSheetId) === -1) {
        setSelectedSheetId(Number(sheets[0].id));
      }
    } else {
      setSelectedSheetId(null);
    }
  }, [selectedSheetId, sheets]);

  const handleContextMenu = useCallback((e: MouseEvent<HTMLDivElement>, sheetId: number) => {
    e.preventDefault();
    setAnchorEl(e.currentTarget);
    setPopoverSheetId(sheetId);
  }, []);

  const preventContextMenu = useCallback((e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleClose = useCallback(() => {
    setPopoverSheetId(null);
  }, []);

  const handleDelete = useCallback(async () => {
    if (popoverSheetId) {
      setPopoverSheetId(null);

      setDeletingSheetId(popoverSheetId);
      await deleteSheet(popoverSheetId);
      setDeletingSheetId(null);
    }
  }, [deleteSheet, popoverSheetId]);

  const handleDuplicate = useCallback(async () => {
    // TODO
  }, []);

  const handleNameChange = useCallback(
    async (newName) => {
      if (popoverSheetId) {
        updateSheetName(popoverSheetId, newName);
      }
    },
    [popoverSheetId, updateSheetName],
  );

  // show loading skeleton
  const loadingSkeletons = [0, 1].map((key) => (
    <Skeleton
      key={key}
      variant="rectangular"
      sx={{
        height: `${TabHeight}px`,
        width: 100,
        margin: '2px',
        borderRadius: 1,
      }}
    />
  ));

  return (
    <Box
      onContextMenu={preventContextMenu}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <TableContainer>{selectedSheet && <DataTable sheet={selectedSheet} />}</TableContainer>

      <Box
        sx={{
          padding: 0.5,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'row',
          borderTop: (theme) => theme.dividerBorder,
        }}
      >
        {showLoading ? (
          loadingSkeletons
        ) : (
          <>
            {sheets.map((sheet) => (
              <Tab
                key={sheet.id}
                className={selectedSheetId === sheet.id ? 'selected' : ''}
                onClick={() => setSelectedSheetId(Number(sheet.id))}
                onDoubleClick={(e) => handleContextMenu(e, Number(sheet.id))}
                onContextMenu={(e) => handleContextMenu(e, Number(sheet.id))}
              >
                {deletingSheetId === sheet.id ? 'deleting...' : sheet.name}
              </Tab>
            ))}
            <Tab onClick={() => createSheet({ name: 'hello world' })}>Create +</Tab>
          </>
        )}
      </Box>

      <SheetPopover
        sheet={popoverSheet}
        anchorEl={anchorEl}
        onNameChange={handleNameChange}
        onClose={handleClose}
        onDuplicate={handleDuplicate}
        onDelete={handleDelete}
      />
    </Box>
  );
}
