import { useState } from 'react';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import { Sheet } from 'shared/schema';
import useApp from '~/hooks/useApp';
import DataTable from '~/components/DataTable';

const useStyles = makeStyles(() =>
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
      height: 40,
      background: '#DEDEDE',
      display: 'flex',
      flexDirection: 'row',
    },
    tab: {
      height: 40,
      width: 200,
      background: '#CCC',
      flexShrink: 0,
    },
  }),
);

export default function SheetContainer({ appId }: { appId: number }) {
  const classes = useStyles();
  const { sheets, createSheet /*, isLoadingSheets*/ } = useApp(appId);
  const [selectedSheet, setSelectedSheet] = useState<Sheet | null>(null);

  return (
    <div className={classes.content}>
      <div className={classes.tableContainer}>
        {selectedSheet && <DataTable sheet={selectedSheet} />}
      </div>
      <div className={classes.tabContainer}>
        {sheets.map((sheet) => (
          <div key={sheet.id} className={classes.tab} onClick={() => setSelectedSheet(sheet)}>
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
