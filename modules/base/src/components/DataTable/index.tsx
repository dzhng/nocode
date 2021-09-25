import { useCallback, useState, useMemo } from 'react';
import { styled } from '@mui/material';
import { Sheet, DataTypes } from 'shared/schema';
import useSheet from '~/hooks/useSheet';
import { AddIcon } from '~/components/Icons';
import { Table, TableHead, TableBody } from './Table';
import Header from './Header';
import Row from './Row';

const DefaultCellWidth = 100;
const DefaultCellHeight = 40;

const AddNewRow = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: theme.palette.grey[100],
  height: DefaultCellHeight,
  fontWeight: 'bold',
  color: theme.palette.grey[700],
  borderRadius: 5,
  cursor: 'pointer',
  boxShadow: '0px 1px 2px 0px rgb(0 0 0 / 8%)',

  '&>svg': {
    marginLeft: 10,
    marginRight: 5,
  },

  '&:hover': {
    backgroundColor: theme.hoverColor,
    color: theme.palette.primary.main,
  },
}));

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
  const [selectedRecords, setSelectedRecords] = useState<number | null>(null);

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

  const totalRowWidth = useMemo(
    () =>
      columns.reduce(
        (sum, column) =>
          sum + (column?.tableMetadata?.width ? column.tableMetadata.width : DefaultCellWidth),
        0,
      ),
    [columns],
  );

  return (
    <Table>
      <TableHead sx={{ marginLeft: '40px' }}>
        <Header
          columns={columns}
          height={DefaultCellHeight}
          width={DefaultCellWidth}
          changeColumnName={(id, data) => changeColumnName(id, data)}
        />
      </TableHead>

      <TableBody>
        {records.map((record) => (
          <Row
            key={record.id ?? -1}
            columns={columns}
            width={DefaultCellWidth}
            defaultHeight={DefaultCellHeight}
            dataForColumn={(columnId) => record.id && cellForRecord(record.id, columnId)?.data}
            editRecord={(columnId, data) => record.id && editRecord(record.id, columnId, data)}
            onAddColumn={onAddColumn}
          />
        ))}

        <AddNewRow onClick={onAddRow} sx={{ width: totalRowWidth + 102 }}>
          <AddIcon />
          New record
        </AddNewRow>
      </TableBody>
    </Table>
  );
}
