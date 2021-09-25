import { useCallback, useState } from 'react';
import { makeStyles, createStyles } from '@mui/styles';
import { Sheet, DataTypes } from 'shared/schema';
import useSheet from '~/hooks/useSheet';
import { Table, TableHead, TableBody } from './Table';
import Header from './Header';
import Row from './Row';

const DefaultCellWidth = 100;
const DefaultCellHeight = 40;

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

function AddNewRow({ onClick }: { onClick(): void }) {
  const classes = useStyles();
  return (
    <div className={classes.row} onClick={onClick}>
      +
    </div>
  );
}

export default function DataTable({ sheet }: { sheet: Sheet }) {
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

  const changeColumnName = useCallback(async (_: number, __: string) => {}, []);

  const onRowHover = useCallback((recordId: number) => {
    setHoveredRecord(recordId);
  }, []);

  const onRowHoverLeave = useCallback(() => {
    setHoveredRecord(null);
  }, []);

  return (
    <Table>
      <TableHead sx={{ width: 'fit-content', height: DefaultCellHeight }}>
        <Header
          columns={columns}
          height={DefaultCellHeight}
          defaultWidth={DefaultCellWidth}
          changeColumnName={(id, data) => changeColumnName(id, data)}
          onAddColumn={onAddColumn}
        />
      </TableHead>

      <TableBody>
        {records.map((record) => (
          <Row
            key={record.id ?? -1}
            columns={columns}
            width={DefaultCellWidth}
            isHovered={hoveredRecord === record.id}
            onHover={() => onRowHover(record.id ?? -1)}
            onHoverLeave={onRowHoverLeave}
            defaultHeight={DefaultCellHeight}
            dataForColumn={(columnId) => record.id && cellForRecord(record.id, columnId)?.data}
            editRecord={(columnId, data) => record.id && editRecord(record.id, columnId, data)}
          />
        ))}

        <AddNewRow onClick={onAddRow} />
      </TableBody>
    </Table>
  );
}
