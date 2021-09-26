import { styled, IconButton, Tooltip } from '@mui/material';
import { ColumnType, CellType } from 'shared/schema';
import { AddIcon } from '~/components/Icons';
import Cell from './Cell';
import DragHandle from './DragHandle';
import { TableRow, TableCell } from './Table';
import { SelectorCellSize, NewColumnCellSize } from './const';

interface PropTypes {
  columns: ColumnType[];
  width: number;
  defaultHeight: number;
  dataForColumn(columnId: number): CellType | undefined;
  editRecord(columnId: number, data: CellType): void;
  onAddColumn(): void;
}

const SelectorCell = styled('div')(() => ({
  width: SelectorCellSize,
  backgroundColor: '#FFF',
}));

// @ts-ignore 'divider' is illegal but can still be used
const Divider = styled('divider')(({ theme }) => ({
  display: 'inline-block',
  width: 0,
  borderRight: `1px solid ${theme.borderColor}`,
  marginLeft: '-1px',
  marginTop: 7,
  marginBottom: 7,
}));

const NewColumnButton = styled('div')(({ theme }) => ({
  width: NewColumnCellSize,
  textAlign: 'center',

  '& button': {
    marginTop: '5px',
  },

  '& svg': {
    width: 20,
    height: 20,
    color: theme.palette.primary.main,
  },
}));

export default function Row({
  columns,
  width,
  defaultHeight,
  dataForColumn,
  editRecord,
  onAddColumn,
}: PropTypes) {
  return (
    <TableRow>
      <SelectorCell>
        <DragHandle />
      </SelectorCell>
      <Divider />

      {columns.map((column, columnIdx) => (
        <>
          <TableCell
            key={column.id}
            sx={{
              minHeight: defaultHeight,
              width,
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
        </>
      ))}
      <NewColumnButton role="button" onClick={onAddColumn}>
        <Tooltip placement="top" title="Add new column">
          <IconButton size="small">
            <AddIcon />
          </IconButton>
        </Tooltip>
      </NewColumnButton>
    </TableRow>
  );
}
