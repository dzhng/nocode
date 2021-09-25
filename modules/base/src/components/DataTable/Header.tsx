import { ColumnType } from 'shared/schema';
import { TableHeaderRow, TableCell } from './Table';
import Cell from './Cell';

interface PropTypes {
  columns: ColumnType[];
  height: number;
  width: number;
  changeColumnName(columnId: number, name: string): void;
}

export default function HeaderRow({ columns, height, width, changeColumnName }: PropTypes) {
  return (
    <TableHeaderRow>
      {columns.map((column) => (
        <TableCell
          key={column.id}
          sx={{
            width,
            height,
            // to make up for divider size in rows
            marginRight: '1px',
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
      ))}
    </TableHeaderRow>
  );
}
