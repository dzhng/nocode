import { ColumnType } from 'shared/schema';
import { AddIcon } from '~/components/Icons';
import { TableRow, TableCell } from './Table';
import Cell from './Cell';

const CellBorderRadius = 5;

interface PropTypes {
  columns: ColumnType[];
  height: number;
  defaultWidth: number;
  changeColumnName(columnId: number, name: string): void;
  onAddColumn(): void;
}

function AddNewColumnHeader({ onClick, width }: { onClick(): void; width: number }) {
  return (
    <TableCell
      sx={{
        width,
        backgroundColor: 'grey.100',
        border: 'none',
        borderBottom: (theme) => `1px solid ${theme.borderColor}`,
        borderTopRightRadius: CellBorderRadius,
        textAlign: 'center',
        '& svg': { width: 20, height: 20, mt: '9px', color: 'primary.main' },
      }}
      onClick={onClick}
    >
      <AddIcon />
    </TableCell>
  );
}

export default function HeaderRow({
  columns,
  height,
  defaultWidth,
  changeColumnName,
  onAddColumn,
}: PropTypes) {
  return (
    <TableRow>
      {columns.map((column, columnIdx) => (
        <TableCell
          key={column.id}
          sx={{
            width: defaultWidth,
            height,
            border: 'none',
            borderBottom: (theme) => `1px solid ${theme.borderColor}`,
            borderRight: (theme) => `1px solid ${theme.borderColor}`,
            fontWeight: 'bold',
            backgroundColor: 'grey.100',
            borderTopLeftRadius: columnIdx === 0 ? CellBorderRadius : 0,
          }}
        >
          <Cell
            isHeader
            column={column}
            onChange={(newData) => {
              changeColumnName(column.id, String(newData));
            }}
          />
        </TableCell>
      ))}
      <AddNewColumnHeader width={defaultWidth} onClick={onAddColumn} />
    </TableRow>
  );
}
