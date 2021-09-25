import { ColumnType, CellType } from 'shared/schema';
import Cell from './Cell';
import { TableRow, TableCell } from './Table';

interface PropTypes {
  columns: ColumnType[];
  width: number;
  isHovered: boolean;
  onHover: () => void;
  onHoverLeave: () => void;
  defaultHeight: number;
  dataForColumn(columnId: number): CellType | undefined;
  editRecord(columnId: number, data: CellType): void;
}

export default function Row({
  columns,
  width,
  isHovered,
  onHover,
  onHoverLeave,
  defaultHeight,
  dataForColumn,
  editRecord,
}: PropTypes) {
  return (
    <TableRow
      onMouseOver={onHover}
      onMouseLeave={onHoverLeave}
      sx={{
        width: 'fit-content',
        bgcolor: (theme) => (isHovered ? theme.hoverColor : 'white'),
      }}
    >
      {columns.map((column) => (
        <TableCell
          key={column.id}
          sx={{
            minHeight: defaultHeight,
            width,
          }}
        >
          <Cell
            column={column}
            data={dataForColumn(column.id)}
            onChange={(newData) => {
              if (newData !== undefined) {
                editRecord(column.id, newData);
              }
            }}
          />
        </TableCell>
      ))}
    </TableRow>
  );
}
