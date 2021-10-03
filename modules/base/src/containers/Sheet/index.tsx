import { useState, useEffect, useCallback, MouseEvent } from 'react';
import clsx from 'clsx';
import { makeStyles, createStyles } from '@mui/styles';
import { Menu, MenuItem, Skeleton } from '@mui/material';
import { Sheet } from 'shared/schema';
import useSheets from '~/hooks/useSheets';
import DataTable from '~/components/DataTable';

const TabHeight = 28;

const useStyles = makeStyles((theme) =>
  createStyles({
    content: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    },
    tableContainer: {
      padding: theme.spacing(1),
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
      flexGrow: 1,
      overflow: 'scroll',
      ...theme.customMixins.scrollBar,
    },
    tabContainer: {
      padding: theme.spacing(1),
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'row',
      borderTop: theme.dividerBorder,
    },
    tab: {
      width: 100,
      lineHeight: `${TabHeight}px`,
      textAlign: 'center',
      background: '#DDD',
      margin: 2,
      borderRadius: theme.shape.borderRadius,
      flexShrink: 0,
      cursor: 'pointer',

      '&.selected': {
        background: '#CCC',
      },
    },
  }),
);

export default function SheetContainer({ appId }: { appId: number }) {
  const classes = useStyles();
  const { sheets, createSheet, deleteSheet, isLoadingSheets } = useSheets(appId);
  const [selectedSheet, setSelectedSheet] = useState<Sheet | null>(null);
  const [deletingSheetId, setDeletingSheetId] = useState<number | null>(null);
  const [contextMenu, setContextMenu] = useState<null | { x: number; y: number; sheetId: number }>(
    null,
  );

  // select the first sheet once it loads
  useEffect(() => {
    setSelectedSheet(!isLoadingSheets && sheets.length > 0 ? sheets[0] : null);
  }, [isLoadingSheets, sheets]);

  const handleContextMenu = useCallback(
    (e: MouseEvent<HTMLDivElement>, sheetId: number) => {
      e.preventDefault();
      setContextMenu(
        contextMenu === null
          ? {
              sheetId: sheetId,
              x: e.clientX - 2,
              y: e.clientY - 4,
            }
          : // repeated contextmenu when it is already open closes it with Chrome 84 on Ubuntu
            // Other native context menus might behave different.
            // With this behavior we prevent contextmenu from the backdrop to re-locale existing context menus.
            null,
      );
    },
    [contextMenu],
  );

  const preventContextMenu = useCallback((e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleClose = useCallback(() => {
    setContextMenu(null);
  }, []);

  const handleDelete = useCallback(async () => {
    if (contextMenu) {
      setDeletingSheetId(contextMenu.sheetId);
      setContextMenu(null);
      await deleteSheet(contextMenu.sheetId);
      setDeletingSheetId(null);
    }
  }, [deleteSheet, contextMenu]);

  // show loading skeleton
  const loadingSkeletons = [0, 1].map((key) => (
    <Skeleton key={key} variant="rectangular" height={TabHeight} className={classes.tab} />
  ));

  return (
    <div className={classes.content} onContextMenu={preventContextMenu}>
      <div className={classes.tableContainer}>
        {selectedSheet && <DataTable sheet={selectedSheet} />}
      </div>

      <div className={classes.tabContainer}>
        {isLoadingSheets ? (
          loadingSkeletons
        ) : (
          <>
            {sheets.map((sheet) => (
              <div
                key={sheet.id}
                className={clsx(classes.tab, selectedSheet === sheet && 'selected')}
                onClick={() => setSelectedSheet(sheet)}
                onContextMenu={(e) => handleContextMenu(e, sheet.id ?? 0)}
              >
                {deletingSheetId === sheet.id ? 'deleting...' : sheet.name}
              </div>
            ))}
            <div className={classes.tab} onClick={() => createSheet({ name: 'hello world' })}>
              Create +
            </div>
          </>
        )}
      </div>

      <Menu
        open={contextMenu !== null}
        onClose={handleClose}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null ? { top: contextMenu.y, left: contextMenu.x } : undefined
        }
      >
        <MenuItem onClick={handleClose}>Rename</MenuItem>
        <MenuItem onClick={handleDelete}>Delete</MenuItem>
      </Menu>
    </div>
  );
}
