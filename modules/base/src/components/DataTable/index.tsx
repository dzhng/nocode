import { useCallback, useState } from 'react';
import { makeStyles, createStyles } from '@mui/styles';
import { Box } from '@mui/material';
import { Sheet, DataTypes } from 'shared/schema';
import useSheet from '~/hooks/useSheet';
import { AddIcon } from '~/components/Icons';
import Cell from './Cell';
import CellContainer from './CellContainer';
import Row from './Row';

const DefaultCellLength = 100;
const DefaultCellHeight = 40;
const CellBorderRadius = 5;

const useStyles = makeStyles((theme) =>
  createStyles({
    container: {
      width: '100%',
      height: '100%',
    },
    row: {
      height: DefaultCellHeight,
    },
  }),
);

function AddNewColumnHeader({ onClick }: { onClick(): void }) {
  return (
    <CellContainer
      sx={{
        width: DefaultCellLength,
        backgroundColor: 'grey.100',
        borderTopRightRadius: CellBorderRadius,
        borderLeft: 'none',
        textAlign: 'center',
        '& svg': { width: 20, height: 20, mt: '9px', color: 'primary.main' },
      }}
      onClick={onClick}
    >
      <AddIcon />
    </CellContainer>
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
  const [hoveredRecord, setHoveredRecord] = useState<number | null>(null);

  const onAddColumn = useCallback(() => {
    addColumn(
      {
        id: generateColumnId(),
        name: 'test',
        type: DataTypes.Text,
      },
      columns.length,
    );
  }, [addColumn, generateColumnId, columns.length]);

  const onAddRow = useCallback(() => createRecord({}, true), [createRecord]);

  const changeColumn = useCallback((_: number, __: { name: string; type: DataTypes }) => {}, []);

  const onRowHover = useCallback((recordId: number) => {
    setHoveredRecord(recordId);
  }, []);

  const onRowHoverLeave = useCallback(() => {
    setHoveredRecord(null);
  }, []);

  return (
    <Box className={classes.container}>
      <Box sx={{ width: 'fit-content', height: DefaultCellHeight }}>
        {columns.map((column, columnIdx) => (
          <CellContainer
            key={column.id}
            sx={{
              width: DefaultCellLength,
              height: DefaultCellHeight,
              fontWeight: 'bold',
              backgroundColor: 'grey.100',
              borderLeft: columnIdx === 0 ? undefined : 'none',
              borderTopLeftRadius: columnIdx === 0 ? CellBorderRadius : 0,
            }}
          >
            <Cell
              isHeader
              column={column}
              onChange={(newData) => {
                changeColumn(column.id, { name: String(newData), type: column.type });
              }}
            />
          </CellContainer>
        ))}
        <AddNewColumnHeader onClick={onAddColumn} />
      </Box>

      {records.map((record) => (
        <Row
          key={record.id ?? -1}
          columns={columns}
          width={DefaultCellLength}
          isHovered={hoveredRecord === record.id}
          onHover={() => onRowHover(record.id ?? -1)}
          onHoverLeave={onRowHoverLeave}
          defaultHeight={DefaultCellHeight}
          dataForColumn={(columnId) => record.id && cellForRecord(record.id, columnId)?.data}
          editRecord={(columnId, data) => record.id && editRecord(record.id, columnId, data)}
        />
      ))}

      <AddNewRow onClick={onAddRow} />
    </Box>
  );
}
