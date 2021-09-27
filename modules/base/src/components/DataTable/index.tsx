import { useCallback, useState, useMemo } from 'react';
import { styled } from '@mui/material';
import { Sheet, DataTypes } from 'shared/schema';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

import useSheet from '~/hooks/useSheet';
import { AddIcon } from '~/components/Icons';
import { Table, TableHead, TableBody } from './Table';
import Header from './Header';
import Row from './Row';
import { SelectorCellSize, NewColumnCellSize, DefaultCellWidth, DefaultCellHeight } from './const';

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
    reorderRecord,
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

  const onDragEnd = useCallback(
    (result: DropResult) => {
      const { source, destination } = result;
      if (!destination) {
        return;
      }

      reorderRecord(source.index, destination.index);
    },
    [reorderRecord],
  );

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
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="droppable">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {records.map((record, index) => (
                  <Draggable key={record.id ?? -1} draggableId={String(record.id)} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        style={provided.draggableProps.style}
                      >
                        <Row
                          isDragging={snapshot.isDragging}
                          dragHandleProps={provided.dragHandleProps}
                          columns={columns}
                          width={DefaultCellWidth}
                          defaultHeight={DefaultCellHeight}
                          dataForColumn={(columnId) =>
                            record.id && cellForRecord(record.id, columnId)?.data
                          }
                          editRecord={(columnId, data) =>
                            record.id && editRecord(record.id, columnId, data)
                          }
                          onAddColumn={onAddColumn}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}

                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        <AddNewRow
          onClick={onAddRow}
          sx={{ width: totalRowWidth + SelectorCellSize + NewColumnCellSize + 2 }}
        >
          <AddIcon />
          New record
        </AddNewRow>
      </TableBody>
    </Table>
  );
}
