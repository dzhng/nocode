import { formatRelativeDate } from 'shared/utils';
import { DataTypes, CellType, FieldType } from 'shared/schema';

import { TextCellInput, NumberCellInput } from './CellInput';
import SelectionCell from './Selection';

interface PropTypes {
  field: FieldType;
  height: number;
  data?: CellType;
  onChange(data: CellType): void;
}

export default function Cell({ field, height, data, onChange }: PropTypes) {
  if (field.type === DataTypes.Text) {
    // should show empty string for empty text cell, or else React may recycle old values
    return (
      <TextCellInput
        value={data === undefined || data === null ? '' : String(data)}
        onChange={onChange}
        height={height}
      />
    );
  } else if (field.type === DataTypes.Image) {
    return <span>Image</span>; // TODO
  } else if (field.type === DataTypes.Number) {
    return (
      <NumberCellInput
        value={data === undefined || data === null ? null : Number(data)}
        onChange={onChange}
        height={height}
      />
    );
  } else if (field.type === DataTypes.File) {
    return <span>File</span>; // TODO
  } else if (field.type === DataTypes.Date) {
    return <span>{data instanceof Date ? formatRelativeDate(data) : ''}</span>;
  } else if (field.type === DataTypes.Selection) {
    return (
      <SelectionCell height={height} field={field} optionId={String(data)} onChange={onChange} />
    );
  } else if (field.type === DataTypes.Relation) {
    return <span>Relational</span>;
  } else {
    return <span>Unknown Data Type</span>;
  }
}
