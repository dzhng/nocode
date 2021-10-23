import { useCallback } from 'react';
import { styled, Box, Tooltip, IconButton } from '@mui/material';
import { DraggableCore, DraggableData } from 'react-draggable';
import { FieldType } from 'shared/schema';
import { AddIcon, ExpandIcon } from '~/components/Icons';
import { TableHeaderRow, TableCell } from './Table';
import { HeaderHeight, NewFieldCellSize } from './const';

const HeaderDividerWidth = 2;

interface PropTypes {
  fields: FieldType[];
  minWidth: number;
  changeField(fieldId: string, data: Partial<FieldType>): void;
  onAddField(): void;
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

export default function HeaderRow({ fields, minWidth, changeField, onAddField }: PropTypes) {
  const handleDrag = useCallback(
    (fieldId: string, data: DraggableData) => {
      const { deltaX } = data;
      const field = fields.find((c) => c.id === fieldId);
      const newWidth = Math.max(
        minWidth,
        (field?.tableMetadata?.width ?? minWidth) + Math.floor(deltaX),
      );
      changeField(fieldId, { tableMetadata: { width: newWidth } });
    },
    [changeField, fields, minWidth],
  );

  return (
    <TableHeaderRow>
      {fields.map((field) => (
        <Box sx={{ position: 'relative' }} key={field.id}>
          {/* Have divider ahead and positioned behind via margin
          so that dragging won't change it's position */}
          <DraggableCore grid={[25, 25]} onDrag={(_, data) => handleDrag(field.id, data)}>
            <Divider
              sx={{
                left: (field.tableMetadata?.width ?? minWidth) - HeaderDividerWidth / 2,
              }}
            />
          </DraggableCore>

          <TableCell
            sx={{
              width: field.tableMetadata?.width ?? minWidth,
              height: HeaderHeight,
            }}
          >
            <FieldName>
              <span>{field.name}</span>
              <IconButton size="small">
                <ExpandIcon />
              </IconButton>
            </FieldName>
          </TableCell>
        </Box>
      ))}

      <TableCell
        sx={{
          width: NewFieldCellSize,
          height: HeaderHeight,
          textAlign: 'center',

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
          <IconButton size="small" onClick={onAddField}>
            <AddIcon />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableHeaderRow>
  );
}
