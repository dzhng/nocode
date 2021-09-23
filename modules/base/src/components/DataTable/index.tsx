import { makeStyles, createStyles } from '@mui/styles';
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
  const {
    records,
    cellForRecord,
    editRecord,
    createRecord,
    columns,
    generateColumnId,
    addColumn,
  } = useSheet(sheet.id);

  const onAddColumn = () =>
    addColumn(
      {
        id: generateColumnId(),
        name: 'test',
        type: DataTypes.Text,
      },
      columns.length,
    );

  const onAddRow = () => createRecord({}, true);

  const changeColumn = (_: number, __: { name: string; type: DataTypes }) => {};

  return (
    <div className={classes.container}>
      <div className={classes.columnHeader}>
        {columns.map((column) => (
          <div key={column.id} className={classes.cellContainer}>
            <Cell
              isHeader
              column={column}
              onChange={(newData) => {
                changeColumn(column.id, { name: String(newData), type: column.type });
              }}
            />
          </div>
        ))}
        <AddNewColumnHeader onClick={onAddColumn} />
      </div>

      <div className={classes.rowContainer}>
        {records.map((record) => (
          <div key={record.id ?? -1} className={classes.row}>
            {columns.map((column) => (
              <div key={column.id} className={classes.cellContainer}>
                <Cell
                  column={column}
                  data={record.id && cellForRecord(record.id, column.id)}
                  onChange={(newData) => {
                    if (record.id && newData !== undefined) {
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
