import { makeStyles, createStyles } from '@material-ui/core/styles';
import { Sheet, DataTypes } from 'shared/schema';
import useSheet from '~/hooks/useSheet';
import Cell from './Cell';

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

function AddNewRow({ onClick }: { onClick(): void }) {
  const classes = useStyles();
  return (
    <div className={classes.row} onClick={onClick}>
      +
    </div>
  );
}

export default function DataTable({ sheet }: { sheet: Sheet }) {
  const classes = useStyles();
  const { records, cellForRecord, editRecord, createRecord, addColumn } = useSheet(sheet.id);

  const onAddColumn = () => {};
  /*addColumn({
      columnID: String(Math.floor(Math.random() * 1000)),
      name: 'test',
      type: DataTypes.Text,
      });*/

  const onAddRow = () => createRecord({}, true);

  const changeColumn = (_: number, __: { name: string; type: DataTypes }) => {};

  return (
    <div className={classes.container}>
      <div className={classes.columnHeader}>
        {sheet.columns.map((column) => (
          <div key={column.id} className={classes.cellContainer}>
            <Cell
              isHeader
              column={column}
              onChange={(newData) => {
                if (column.id) {
                  changeColumn(column.id, { name: String(newData), type: column.type });
                }
              }}
            />
          </div>
        ))}
        <AddNewColumnHeader onClick={onAddColumn} />
      </div>

      <div className={classes.rowContainer}>
        {records.map((record) => (
          <div key={record.id} className={classes.row}>
            {sheet.columns.map((column) => (
              <div key={column.id} className={classes.cellContainer}>
                <Cell
                  column={column}
                  data={record.id && column.id && cellForRecord(record.id, column.id)}
                  onChange={(newData) => {
                    if (record.id && column.id && newData !== undefined) {
                      editRecord(record.id, column.id, newData);
                    }
                  }}
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className={classes.rowContainer}>
        <AddNewRow onClick={onAddRow} />
      </div>
    </div>
  );
}
