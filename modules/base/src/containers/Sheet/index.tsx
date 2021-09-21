import { useState, useEffect } from 'react';
import clsx from 'clsx';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import { Sheet } from 'shared/schema';
import useApp from '~/hooks/useApp';
import DataTable from '~/components/DataTable';

const useStyles = makeStyles((theme) =>
  createStyles({
    content: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    },
    tableContainer: {
      flexGrow: 1,
    },
    tabContainer: {
      flexShrink: 0,
      height: 30,
      display: 'flex',
      flexDirection: 'row',
    },
    tab: {
      width: 100,
      lineHeight: '28px',
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
  const { sheets, createSheet, isLoadingSheets } = useApp(appId);
  const [selectedSheet, setSelectedSheet] = useState<Sheet | null>(null);

  // select the first sheet once it loads
  useEffect(() => {
    if (!isLoadingSheets && sheets.length > 0) {
      setSelectedSheet(sheets[0]);
    }
  }, [isLoadingSheets, sheets]);

  return (
    <div className={classes.content}>
      <div className={classes.tableContainer}>
        {selectedSheet && <DataTable sheet={selectedSheet} />}
      </div>
      <div className={classes.tabContainer}>
        {sheets.map((sheet) => (
          <div
            key={sheet.id}
            className={clsx(classes.tab, selectedSheet === sheet && 'selected')}
            onClick={() => setSelectedSheet(sheet)}
          >
            {sheet.name}
          </div>
        ))}
        <div className={classes.tab} onClick={() => createSheet({ name: 'hello world' })}>
          Create +
        </div>
      </div>
    </div>
  );
}
