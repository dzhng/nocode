import { useState, useEffect, useCallback, useMemo, MouseEvent } from 'react';
import { debounce } from 'lodash';
import { styled } from '@mui/styles';
import { Box, Skeleton } from '@mui/material';
import { Sheet } from 'shared/schema';
import useSheets from '~/hooks/useSheets';
import DataTable from '~/components/DataTable';
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

  '&.selected': {
    background: '#CCC',
  },
}));

export default function SheetContainer({ appId }: { appId: number }) {
  const { sheets, createSheet, deleteSheet, updateSheetName, isLoadingSheets } = useSheets(appId);
  const [selectedSheet, setSelectedSheet] = useState<Sheet | null>(null);
  const [deletingSheetId, setDeletingSheetId] = useState<number | null>(null);

  // for managing popover
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  const [popoverSheet, setPopoverSheet] = useState<Sheet | null>(null);

  const showLoading = isLoadingSheets && sheets.length === 0;

  const debouncedNameUpdate = useMemo(
    () =>
      debounce((sheetId: number, name: string) => {
        updateSheetName(sheetId, name);
      }, 500),
    [updateSheetName],
  );

  // select the first sheet once it loads if none is selected
  useEffect(() => {
    if (sheets.length > 0) {
      if (sheets.findIndex((s) => s === selectedSheet) === -1) {
        setSelectedSheet(sheets[0]);
      }
    } else {
      setSelectedSheet(null);
    }
  }, [selectedSheet, sheets]);

  const handleContextMenu = useCallback((e: MouseEvent<HTMLDivElement>, sheet: Sheet) => {
    e.preventDefault();
    setAnchorEl(e.currentTarget);
    setPopoverSheet(sheet);
  }, []);

  const preventContextMenu = useCallback((e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleClose = useCallback(() => {
    setPopoverSheet(null);
  }, []);

  const handleDelete = useCallback(async () => {
    if (popoverSheet) {
      setPopoverSheet(null);

      setDeletingSheetId(Number(popoverSheet.id));
      await deleteSheet(Number(popoverSheet.id));
      setDeletingSheetId(null);
    }
  }, [deleteSheet, popoverSheet]);

  const handleDuplicate = useCallback(async () => {
    // TODO
  }, []);

  const handleNameChange = useCallback(
    async (newName) => {
      debouncedNameUpdate(Number(popoverSheet?.id), newName);
    },
    [popoverSheet, debouncedNameUpdate],
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
        borderRadius: (theme) => `${theme.shape.borderRadius}px`,
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
                className={selectedSheet === sheet ? 'selected' : ''}
                onClick={() => setSelectedSheet(sheet)}
                onDoubleClick={(e) => handleContextMenu(e, sheet)}
                onContextMenu={(e) => handleContextMenu(e, sheet)}
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
