import { useCallback } from 'react';
import { styled, Box, Tooltip, IconButton } from '@mui/material';
import { DraggableCore, DraggableData } from 'react-draggable';
import { ColumnType } from 'shared/schema';
import { AddIcon, ExpandIcon } from '~/components/Icons';
import { TableHeaderRow, TableCell } from './Table';
import { HeaderHeight, NewColumnCellSize } from './const';

const HeaderDividerWidth = 2;

interface PropTypes {
  columns: ColumnType[];
  minWidth: number;
  changeColumnName(columnId: number, name: string): void;
  changeColumnWidth(columnId: number, width: number): void;
  onAddColumn(): void;
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

const ColumnName = styled('div')(({ theme }) => ({
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

export default function HeaderRow({
  columns,
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
                left: (column.tableMetadata?.width ?? minWidth) - HeaderDividerWidth / 2,
              }}
            />
          </DraggableCore>

          <TableCell
            sx={{
              width: column.tableMetadata?.width ?? minWidth,
              height: HeaderHeight,
            }}
          >
            <ColumnName>
              <span>{column.name}</span>
              <IconButton size="small">
                <ExpandIcon />
              </IconButton>
            </ColumnName>
          </TableCell>
        </Box>
      ))}

      <TableCell
        sx={{
          width: NewColumnCellSize,
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
        <Tooltip placement="bottom" title="Add new column">
          <IconButton size="small" onClick={onAddColumn}>
            <AddIcon />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableHeaderRow>
  );
}
