import { useState, useCallback, useMemo } from 'react';
import { styled } from '@mui/material';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

import { AddIcon } from '~/components/Icons';
import useSheetContext from './Context';
import { Table, TableHead, TableBody } from './Table';
import Header from './Header';
import Row from './Row';
import { SelectorCellSize, DefaultCellWidth, DefaultCellHeight } from './const';

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

export default function DataTable() {
  const {
    sheet,
    records,
    cellDataForRecord,
    editRecord,
    createRecord,
    reorderRecord,
  } = useSheetContext();
  const [isDraggingFields, setIsDraggingFields] = useState(false);
  //const [selectedRecords, setSelectedRecords] = useState<number | null>(null);

  const onAddRow = useCallback(() => createRecord({}, records.length), [createRecord, records]);

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
      sheet.fields.reduce(
        (sum, field) =>
          sum + (field?.tableMetadata?.width ? field.tableMetadata.width : DefaultCellWidth),
        0,
      ),
    [sheet],
  );

  return (
    <Table
      sx={{
        padding: 1,
        paddingLeft: 2,
        paddingRight: 2,
      }}
    >
      <TableHead sx={{ marginLeft: `${SelectorCellSize}px` }}>
        <Header
          minWidth={DefaultCellWidth}
          onFieldDragStart={() => setIsDraggingFields(true)}
          onFieldDragEnd={() => setIsDraggingFields(false)}
        />
      </TableHead>

      <TableBody>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="droppable">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {records.map((record, index) => (
                  <Draggable key={record.slug} draggableId={record.slug} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        style={provided.draggableProps.style}
                      >
                        <Row
                          sx={
                            isDraggingFields ? { opacity: 0.5, pointerEvents: 'none' } : undefined
                          }
                          dragHandleProps={provided.dragHandleProps}
                          fields={sheet.fields}
                          index={index}
                          minWidth={DefaultCellWidth}
                          defaultHeight={DefaultCellHeight}
                          dataForField={(fieldId) => cellDataForRecord(record, fieldId)}
                          editRecord={(fieldId, data) => editRecord(record.slug, fieldId, data)}
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
          sx={{
            width: totalRowWidth + SelectorCellSize + 2,
            visibility: isDraggingFields ? 'hidden' : 'visible',
          }}
        >
          <AddIcon />
          New record
        </AddNewRow>
      </TableBody>
    </Table>
  );
}
