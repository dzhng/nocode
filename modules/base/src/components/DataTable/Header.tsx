import { useCallback } from 'react';
import { styled, Box, Tooltip, IconButton } from '@mui/material';
import { DraggableCore, DraggableData } from 'react-draggable';
import { ColumnType } from 'shared/schema';
import { AddIcon } from '~/components/Icons';
import { TableHeaderRow, TableCell } from './Table';
import { NewColumnCellSize } from './const';
import Cell from './Cell';

interface PropTypes {
  columns: ColumnType[];
  height: number;
  minWidth: number;
  changeColumnName(columnId: number, name: string): void;
  changeColumnWidth(columnId: number, width: number): void;
  onAddColumn(): void;
}

const DividerWidth = 5;

const Divider = styled('span')(({ theme }) => ({
  position: 'absolute',
  display: 'inline-block',
  width: DividerWidth,
  backgroundColor: theme.palette.grey[300],
  top: 12,
  height: 16,
  zIndex: 10,
  cursor: 'col-resize',
}));

export default function HeaderRow({
  columns,
  height,
  minWidth,
  changeColumnName,
  changeColumnWidth,
  onAddColumn,
}: PropTypes) {
  const handleDrag = useCallback(
    (columnId: number, data: DraggableData) => {
      const { deltaX } = data;
      const column = columns.find((c) => c.id === columnId);
      const newWidth = Math.max(
        minWidth,
        (column?.tableMetadata?.width ?? minWidth) + Math.floor(deltaX),
      );
      changeColumnWidth(columnId, newWidth);
    },
    [changeColumnWidth, columns, minWidth],
  );

  return (
    <TableHeaderRow>
      {columns.map((column) => (
        <Box sx={{ position: 'relative' }} key={column.id}>
          {/* Have divider ahead and positioned behind via margin
          so that dragging won't change it's position */}
          <DraggableCore grid={[25, 25]} onDrag={(_, data) => handleDrag(column.id, data)}>
            <Divider
              sx={{
                left: (column.tableMetadata?.width ?? minWidth) - DividerWidth,
              }}
            />
          </DraggableCore>

          <TableCell
            sx={{
              width: column.tableMetadata?.width ?? minWidth,
              height,
            }}
          >
            <Cell
              isHeader
              defaultHeight={height}
              column={column}
              onChange={(newData) => {
                changeColumnName(column.id, String(newData));
              }}
            />
          </TableCell>
        </Box>
      ))}

      <TableCell
        sx={{
          width: NewColumnCellSize,
          height,
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
        <Tooltip placement="bottom" title="Add new column">
          <IconButton size="small" onClick={onAddColumn}>
            <AddIcon />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableHeaderRow>
  );
}
