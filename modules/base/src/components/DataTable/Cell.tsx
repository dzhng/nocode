import { formatRelativeDate } from 'shared/utils';
import { DataTypes, CellType, FieldType } from 'shared/schema';

import { TextCellInput, NumberCellInput } from './CellInput';

interface PropTypes {
  field: FieldType;
  defaultHeight: number;
  data?: CellType;
  isHeader?: boolean;
  onChange(data?: CellType): void;
}

export default function Cell({ field, defaultHeight, data, isHeader, onChange }: PropTypes) {
  const getCellComponent = (): JSX.Element => {
    if (field.type === DataTypes.Text) {
      // should show empty string for empty text cell, or else React may recycle old values
      return (
        <TextCellInput
          value={data === undefined || data === null ? '' : String(data)}
          onChange={onChange}
          defaultHeight={defaultHeight}
        />
      );
    } else if (field.type === DataTypes.Image) {
      return <span>Image</span>; // TODO
    } else if (field.type === DataTypes.Number) {
      return (
        <NumberCellInput
          value={data === undefined || data === null ? undefined : Number(data)}
          onChange={onChange}
          defaultHeight={defaultHeight}
        />
      );
    } else if (field.type === DataTypes.File) {
      return <span>File</span>; // TODO
    } else if (field.type === DataTypes.Date) {
      return <span>{data instanceof Date ? formatRelativeDate(data) : ''}</span>;
    } else if (field.type === DataTypes.Selection) {
      return <span></span>;
    } else if (field.type === DataTypes.Relation) {
      return <span>Relational</span>;
    } else {
      return <span>Unknown Data Type</span>;
    }
  };

  return isHeader ? (
    <TextCellInput value={field.name} onChange={onChange} defaultHeight={defaultHeight} isHeader />
  ) : (
    getCellComponent()
  );
}
