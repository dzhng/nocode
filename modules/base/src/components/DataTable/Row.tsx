import { Fragment } from 'react';
import { styled, Box } from '@mui/material';
import { SxProps } from '@mui/system';
import { FieldType, CellType } from 'shared/schema';
import Cell from './Cell';
import DragHandle from './DragHandle';
import { TableRow, TableCell } from './Table';
import { SelectorCellSize } from './const';

interface PropTypes {
  sx?: SxProps;
  dragHandleProps?: any;
  fields: FieldType[];
  index: number;
  minWidth: number;
  height: number;
  dataForField(fieldId: string): CellType | undefined;
  editRecord(fieldId: string, data: CellType): void;
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
  sx,
  dragHandleProps,
  fields,
  index,
  minWidth,
  height,
  dataForField,
  editRecord,
}: PropTypes) {
  return (
    <TableRow sx={sx}>
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
            lineHeight: `${height}px`,
            fontWeight: 700,
            fontSize: '0.8rem',
            color: 'grey.400',
          }}
        >
          {index + 1}
        </Box>
        <DragHandle {...dragHandleProps} />
      </SelectorCell>
      <Divider />

      {fields.map((field, fieldIdx) => (
        <Fragment key={field.id}>
          <TableCell
            sx={{
              height: height,
              width: field.tableMetadata?.width ?? minWidth,
              borderTopRightRadius: fieldIdx === fields.length - 1 ? 5 : 0,
              borderBottomRightRadius: fieldIdx === fields.length - 1 ? 5 : 0,
            }}
          >
            <Cell
              field={field}
              height={height}
              data={dataForField(field.id)}
              onChange={(newData) => {
                editRecord(field.id, newData);
              }}
            />
          </TableCell>
          {fieldIdx !== fields.length - 1 && <Divider />}
        </Fragment>
      ))}
    </TableRow>
  );
}
