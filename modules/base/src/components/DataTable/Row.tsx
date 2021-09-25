import { Box } from '@mui/material';
import { ColumnType, CellType } from 'shared/schema';
import Cell from './Cell';
import CellContainer from './CellContainer';

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
    <Box
      onMouseOver={onHover}
      onMouseLeave={onHoverLeave}
      sx={{
        height: defaultHeight,
        width: 'fit-content',
        bgcolor: (theme) => (isHovered ? theme.hoverColor : 'white'),
      }}
    >
      {columns.map((column, columnIdx) => (
        <CellContainer
          key={column.id}
          sx={{
            width,
            borderLeft: columnIdx === 0 ? undefined : 'none',
            borderTop: 'none',
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
        </CellContainer>
      ))}
    </Box>
  );
}
