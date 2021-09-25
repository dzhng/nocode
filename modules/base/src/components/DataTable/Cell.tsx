import { formatRelativeDate } from 'shared/utils';
import { DataTypes, CellType, ColumnType } from 'shared/schema';

import { TextCellInput, NumberCellInput } from './CellInput';

interface PropTypes {
  column: ColumnType;
  defaultHeight: number;
  data?: CellType;
  isHeader?: boolean;
  onChange(data?: CellType): void;
}

export default function Cell({ column, defaultHeight, data, isHeader, onChange }: PropTypes) {
  const getCellComponent = (): JSX.Element => {
    if (column.type === DataTypes.Text) {
      // should show empty string for empty text cell, or else React may recycle old values
      return (
        <TextCellInput
          value={data === undefined ? '' : String(data)}
          onChange={onChange}
          defaultHeight={defaultHeight}
        />
      );
    } else if (column.type === DataTypes.Image) {
      return <span>Image</span>; // TODO
    } else if (column.type === DataTypes.Number) {
      return (
        <NumberCellInput
          value={data === undefined ? undefined : Number(data)}
          onChange={onChange}
          defaultHeight={defaultHeight}
        />
      );
    } else if (column.type === DataTypes.File) {
      return <span>File</span>; // TODO
    } else if (column.type === DataTypes.Date) {
      return <span>{data instanceof Date ? formatRelativeDate(data) : ''}</span>;
    } else if (column.type === DataTypes.Location) {
      return (
        <TextCellInput value={String(data)} onChange={onChange} defaultHeight={defaultHeight} />
      );
    } else if (column.type === DataTypes.Selection) {
      return <span></span>;
    } else if (column.type === DataTypes.Relation) {
      return <span>Relational</span>;
    } else {
      return <span>Unknown Data Type</span>;
    }
  };

  return isHeader ? (
    <TextCellInput value={column.name} onChange={onChange} defaultHeight={defaultHeight} isHeader />
  ) : (
    getCellComponent()
  );
}
