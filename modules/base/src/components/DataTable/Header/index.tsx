import { useState, useCallback, MouseEvent } from 'react';
import { styled, Box, Tooltip, IconButton } from '@mui/material';
import { DraggableCore, DraggableData } from 'react-draggable';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { FieldType, DataTypes } from 'shared/schema';
import { AddIcon, ExpandIcon } from '~/components/Icons';
import useSheetContext from '../Context';
import { TableHeaderRow, TableCell } from '../Table';
import { HeaderHeight, NewFieldCellSize } from '../const';
import FieldPopover from './FieldPopover';

const HeaderDividerWidth = 2;

interface PropTypes {
  minWidth: number;
  onFieldDragStart?(fieldId: string): void;
  onFieldDragEnd?(fieldId: string): void;
}

const Divider = styled('span')(({ theme }) => ({
  position: 'absolute',
  display: 'inline-block',
  width: HeaderDividerWidth,
  backgroundColor: theme.palette.grey[300],
  top: 12,
  height: 16,
  zIndex: 10,
  cursor: 'col-resize',
}));

const FieldName = styled('div')(({ theme }) => ({
  paddingLeft: theme.spacing(1),
  paddingRight: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',

  '& span': {
    height: HeaderHeight,
    lineHeight: `${HeaderHeight}px`,
    flexGrow: 1,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  '& button': {
    width: 25,
    height: 25,
  },
  '& svg': {
    width: 15,
    height: 15,
  },
}));

export default function HeaderRow({ minWidth, onFieldDragStart, onFieldDragEnd }: PropTypes) {
  const { sheet, changeField, reorderField, addField, generateFieldId } = useSheetContext();

  // for managing popover
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [popoverFieldId, setPopoverFieldId] = useState<string | null>(null);
  const popoverFieldIndex = sheet.fields?.findIndex((f) => f.id === popoverFieldId);
  const popoverField: FieldType | undefined = sheet.fields?.[popoverFieldIndex];

  const handleDrag = useCallback(
    (fieldId: string, data: DraggableData) => {
      const { deltaX } = data;
      const field = sheet.fields.find((c) => c.id === fieldId);
      const newWidth = Math.max(
        minWidth,
        (field?.tableMetadata?.width ?? minWidth) + Math.floor(deltaX),
      );
      changeField(fieldId, { tableMetadata: { width: newWidth } });
    },
    [changeField, sheet.fields, minWidth],
  );

  const handleFieldPopover = useCallback((e: MouseEvent<HTMLButtonElement>, fieldId: string) => {
    e.preventDefault();
    setAnchorEl(e.currentTarget);
    setPopoverFieldId(fieldId);
  }, []);

  const handleClose = useCallback(() => {
    setPopoverFieldId(null);
  }, []);

  const handleAddField = useCallback(() => {
    addField(
      {
        id: generateFieldId(),
        name: 'test',
        type: DataTypes.Text,
      },
      sheet.fields.length,
    );
  }, [addField, generateFieldId, sheet]);

  const onDragStart = useCallback(
    (result: DropResult) => {
      onFieldDragStart?.(result.draggableId);
    },
    [onFieldDragStart],
  );

  const onDragEnd = useCallback(
    (result: DropResult) => {
      const { source, destination } = result;
      if (!destination) {
        return;
      }

      onFieldDragEnd?.(result.draggableId);
      reorderField(source.index, destination.index);
    },
    [onFieldDragEnd, reorderField],
  );

  return (
    <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <Droppable direction="horizontal" droppableId="droppable">
        {(provided, snapshot) => (
          <TableHeaderRow {...provided.droppableProps} ref={provided.innerRef}>
            {sheet.fields.map((field, index) => (
              <Draggable key={field.id} draggableId={field.id} index={index}>
                {(provided, snapshot) => (
                  <Box
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    style={provided.draggableProps.style}
                    sx={{
                      position: 'relative',
                      borderRadius: 1,
                      border: (theme) => (snapshot.isDragging ? theme.dividerBorder : 'none'),
                      backgroundColor: snapshot.isDragging ? 'grey.100' : 'white',
                      overflow: snapshot.isDragging ? 'hidden' : 'visible',
                    }}
                    key={field.id}
                  >
                    {/* Have divider ahead and positioned behind via margin
          so that dragging won't change it's position */}
                    <DraggableCore grid={[25, 25]} onDrag={(_, data) => handleDrag(field.id, data)}>
                      <Divider
                        sx={{
                          left: (field.tableMetadata?.width ?? minWidth) - HeaderDividerWidth / 2,
                          visibility: snapshot.isDragging ? 'hidden' : 'visible',
                        }}
                      />
                    </DraggableCore>

                    <TableCell
                      sx={{
                        width: field.tableMetadata?.width ?? minWidth,
                        height: HeaderHeight,
                      }}
                    >
                      <FieldName {...provided.dragHandleProps}>
                        <span>{field.name}</span>
                        <Tooltip placement="bottom" title="Edit field">
                          <IconButton size="small" onClick={(e) => handleFieldPopover(e, field.id)}>
                            <ExpandIcon />
                          </IconButton>
                        </Tooltip>
                      </FieldName>
                    </TableCell>
                  </Box>
                )}
              </Draggable>
            ))}

            <TableCell
              sx={{
                width: NewFieldCellSize,
                height: HeaderHeight,
                textAlign: 'center',
                visibility: !!snapshot.draggingFromThisWith ? 'hidden' : 'visible',

                '& button': {
                  marginTop: '5px',
                },

                '& svg': {
                  width: 20,
                  height: 20,
                  color: 'primary.main',
                },
              }}
            >
              <Tooltip placement="bottom" title="Add new field">
                <IconButton size="small" onClick={handleAddField}>
                  <AddIcon />
                </IconButton>
              </Tooltip>
            </TableCell>

            {provided.placeholder}
          </TableHeaderRow>
        )}
      </Droppable>

      <FieldPopover
        field={popoverField}
        anchorEl={anchorEl}
        canMoveLeft={popoverFieldIndex !== 0}
        canMoveRight={popoverFieldIndex < sheet.fields.length - 1}
        onMoveLeft={() => reorderField(popoverFieldIndex, popoverFieldIndex - 1)}
        onMoveRight={() => reorderField(popoverFieldIndex, popoverFieldIndex + 1)}
        onClose={handleClose}
      />
    </DragDropContext>
  );
}
