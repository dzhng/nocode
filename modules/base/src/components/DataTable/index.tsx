import { makeStyles, createStyles } from '@mui/styles';
import { Box } from '@mui/material';
import { Sheet, DataTypes } from 'shared/schema';
import useSheet from '~/hooks/useSheet';
import Cell from './Cell';

const DefaultCellLength = 100;
const CellBorderRadius = 5;

const useStyles = makeStyles((theme) =>
  createStyles({
    container: {
      width: '100%',
      height: '100%',
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
      width: DefaultCellLength,
      height: '100%',
      overflow: 'hidden',
      borderColor: theme.palette.grey[300],
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
        {columns.map((column, columnIdx) => (
          <Box
            key={column.id}
            className={classes.cellContainer}
            sx={{
              borderLeft: columnIdx === 0 ? 1 : 0,
              borderTop: 1,
              borderBottom: 1,
              borderRight: 1,
              borderTopLeftRadius: columnIdx === 0 ? CellBorderRadius : 0,
              borderTopRightRadius: columnIdx === columns.length - 1 ? CellBorderRadius : 0,
            }}
          >
            <Cell
              isHeader
              column={column}
              onChange={(newData) => {
                changeColumn(column.id, { name: String(newData), type: column.type });
              }}
            />
          </Box>
        ))}
        <AddNewColumnHeader onClick={onAddColumn} />
      </div>

      <div className={classes.rowContainer}>
        {records.map((record, recordIdx) => (
          <div key={record.id ?? -1} className={classes.row}>
            {columns.map((column, columnIdx) => (
              <Box
                key={column.id}
                className={classes.cellContainer}
                sx={{
                  borderLeft: columnIdx === 0 ? 1 : 0,
                  borderBottom: 1,
                  borderRight: 1,
                  borderBottomLeftRadius:
                    recordIdx === records.length - 1 && columnIdx === 0 ? CellBorderRadius : 0,
                  borderBottomRightRadius:
                    recordIdx === records.length - 1 && columnIdx === columns.length - 1
                      ? CellBorderRadius
                      : 0,
                }}
              >
                <Cell
                  column={column}
                  data={record.id && cellForRecord(record.id, column.id)?.data}
                  onChange={(newData) => {
                    if (record.id && newData !== undefined) {
                      editRecord(record.id, column.id, newData);
                    }
                  }}
                />
              </Box>
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
