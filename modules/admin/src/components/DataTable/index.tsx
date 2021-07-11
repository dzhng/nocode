import { makeStyles, createStyles } from '@material-ui/core/styles';
import { DataTypes, ColumnType, RowType, CellType } from '~/types';
import Cell from './Cell';

interface PropTypes {
  columns: ColumnType[];
  data: RowType[];
  addColumn(type: ColumnType): void;
  changeCell(location: { columnID: string; rowID?: string }, value?: CellType): void;
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
    cellContainer: {
      display: 'inline-block',
      width: 100,
      height: '100%',
      border: theme.dividerBorder,
      overflow: 'hidden',
    },
  }),
);

function AddNewColumnHeader({ onClick }: { onClick(): void }) {
  const classes = useStyles();
  return (
    <div className={classes.cellContainer} onClick={onClick}>
      +
    </div>
  );
}

export default function DataTable({ columns, data, addColumn, changeCell }: PropTypes) {
  const classes = useStyles();

  const add = () =>
    addColumn({
      columnID: String(Math.floor(Math.random() * 1000)),
      name: 'test',
      type: DataTypes.Text,
    });

  return (
    <div className={classes.container}>
      <div className={classes.columnHeader}>
        {columns.map((column) => (
          <div className={classes.cellContainer}>
            <Cell
              isHeader
              column={column}
              onChange={(newData) => changeCell({ columnID: column.columnID }, newData)}
            />
          </div>
        ))}
        <AddNewColumnHeader onClick={add} />
      </div>

      <div className={classes.rowContainer}>
        {data.map((dataRow) => (
          <div className={classes.row}>
            {columns.map((column) => (
              <div className={classes.cellContainer}>
                <Cell
                  column={column}
                  data={dataRow[column.columnID]}
                  onChange={(newData) =>
                    changeCell({ columnID: column.columnID, rowID: dataRow._id }, newData)
                  }
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
