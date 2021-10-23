import { useCallback, useMemo } from 'react';
import { styled } from '@mui/material';
import { Sheet, DataTypes } from 'shared/schema';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

import useSheet from '~/hooks/useSheet';
import { AddIcon } from '~/components/Icons';
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

export default function DataTable({ sheet }: { sheet: Sheet }) {
  const {
    records,
    cellDataForRecord,
    editRecord,
    createRecord,
    reorderRecord,
    generateFieldId,
    addField,
    changeField,
  } = useSheet(sheet.id);
  //const [selectedRecords, setSelectedRecords] = useState<number | null>(null);

  const onAddField = useCallback(() => {
    addField(
      {
        id: generateFieldId(),
        name: 'test',
        type: DataTypes.Text,
      },
      sheet.fields.length,
    );
  }, [addField, generateFieldId, sheet]);

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
          fields={sheet.fields}
          minWidth={DefaultCellWidth}
          changeField={changeField}
          onAddField={onAddField}
        />
      </TableHead>

      <TableBody>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="droppable">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {records.map((record, index) => (
                  <Draggable key={record.slug} draggableId={record.slug} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        style={provided.draggableProps.style}
                      >
                        <Row
                          isDragging={snapshot.isDragging}
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

        <AddNewRow onClick={onAddRow} sx={{ width: totalRowWidth + SelectorCellSize + 2 }}>
          <AddIcon />
          New record
        </AddNewRow>
      </TableBody>
    </Table>
  );
}
