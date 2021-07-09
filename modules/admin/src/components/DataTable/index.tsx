import { makeStyles, createStyles } from '@material-ui/core/styles';
import type { ColumnType, RowType } from '~/types';

interface PropTypes {
  columns: ColumnType[];
  data: RowType[];
}

const useStyles = makeStyles((theme) =>
  createStyles({
    container: {
      width: '100%',
      height: '100%',
    },
    columnHeader: {
      height: 40,
    },
    columnItem: {
      width: 100,
    },
    rowContainer: {},
    row: {
      height: 40,
    },
    rowItem: {
      width: 100,
    },
  }),
);

export default function DataTable({ columns, data }: PropTypes) {
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <div className={classes.columnHeader}>
        {columns.map((column) => (
          <div className={classes.columnItem}>{column.name}</div>
        ))}
      </div>

      <div className={classes.rowContainer}>
        {data.map((dataRow) => (
          <div className={classes.row}>
            {columns.map((column) => (
              <div className={classes.rowItem}>{JSON.stringify(dataRow[column.columnID])}</div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
