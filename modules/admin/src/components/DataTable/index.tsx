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
      overflow: 'scroll',
    },
    columnHeader: {
      height: 40,
    },
    rowContainer: {},
    row: {
      height: 40,
    },
    cell: {
      display: 'inline-block',
      width: 100,
      height: '100%',
      border: theme.dividerBorder,
      overflow: 'hidden',
    },
  }),
);

function AddNewColumnHeader() {
  const classes = useStyles();
  return <div className={classes.cell}>+</div>;
}

export default function DataTable({ columns, data }: PropTypes) {
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <div className={classes.columnHeader}>
        {columns.map((column) => (
          <div className={classes.cell}>{column.name}</div>
        ))}
        <AddNewColumnHeader />
      </div>

      <div className={classes.rowContainer}>
        {data.map((dataRow) => (
          <div className={classes.row}>
            {columns.map((column) => (
              <div className={classes.cell}>{JSON.stringify(dataRow[column.columnID])}</div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
