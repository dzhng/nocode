import { Fragment } from 'react';
import { styled, Box } from '@mui/material';
import { ColumnType, CellType } from 'shared/schema';
import Cell from './Cell';
import DragHandle from './DragHandle';
import { TableRow, TableCell } from './Table';
import { SelectorCellSize } from './const';

interface PropTypes {
  isDragging?: boolean;
  dragHandleProps?: any;
  columns: ColumnType[];
  index: number;
  minWidth: number;
  defaultHeight: number;
  dataForColumn(columnId: number): CellType | undefined;
  editRecord(columnId: number, data: CellType): void;
  onAddColumn(): void;
}

const SelectorCell = styled('div')(() => ({
  width: SelectorCellSize,
  backgroundColor: '#FFF',
}));

const Divider = styled('span')(({ theme }) => ({
  display: 'inline-block',
  width: 0,
  borderRight: `1px solid ${theme.borderColor}`,
  marginLeft: '-1px',
  marginTop: 7,
  marginBottom: 7,
}));

export default function Row({
  isDragging,
  dragHandleProps,
  columns,
  index,
  minWidth,
  defaultHeight,
  dataForColumn,
  editRecord,
  onAddColumn,
}: PropTypes) {
  return (
    <TableRow>
      <SelectorCell
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-evenly',
        }}
      >
        <Box
          component="span"
          sx={{
            ml: 0.5,
            lineHeight: `${defaultHeight}px`,
            fontWeight: 700,
            fontSize: '0.8rem',
            color: 'grey.400',
          }}
        >
          {index + 1}
        </Box>
        <DragHandle isDragging={false} {...dragHandleProps} />
      </SelectorCell>
      <Divider />

      {columns.map((column, columnIdx) => (
        <Fragment key={column.id}>
          <TableCell
            sx={{
              minHeight: defaultHeight,
              width: column.tableMetadata?.width ?? minWidth,
              borderTopRightRadius: columnIdx === columns.length - 1 ? 5 : 0,
              borderBottomRightRadius: columnIdx === columns.length - 1 ? 5 : 0,
            }}
          >
            <Cell
              column={column}
              defaultHeight={defaultHeight}
              data={dataForColumn(column.id)}
              onChange={(newData) => {
                if (newData !== undefined) {
                  editRecord(column.id, newData);
                }
              }}
            />
          </TableCell>
          {columnIdx !== columns.length - 1 && <Divider />}
        </Fragment>
      ))}
    </TableRow>
  );
}
