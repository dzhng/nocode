import { makeStyles, createStyles } from '@material-ui/core/styles';
import { formatRelativeDate } from 'nocode-shared/utils';
import { DataTypes, CellType, ColumnType } from '~/types';

import { TextCellInput, NumberCellInput } from './CellInput';

interface PropTypes {
  column: ColumnType;
  data?: CellType;
  isHeader?: boolean;
  onChange(data?: CellType): void;
}

const useStyles = makeStyles(() =>
  createStyles({
    container: {
      width: '100%',
      height: '100%',
    },
  }),
);

export default function Cell({ column, data, isHeader, onChange }: PropTypes) {
  const classes = useStyles();

  const getCellComponent = (): JSX.Element => {
    if (column.type === DataTypes.Text) {
      // should show empty string for empty text cell, or else React may recycle old values
      return <TextCellInput value={data === undefined ? '' : String(data)} onChange={onChange} />;
    } else if (column.type === DataTypes.Image) {
      return <span>Image</span>; // TODO
    } else if (column.type === DataTypes.Number) {
      return (
        <NumberCellInput
          value={data === undefined ? undefined : Number(data)}
          onChange={onChange}
        />
      );
    } else if (column.type === DataTypes.File) {
      return <span>File</span>; // TODO
    } else if (column.type === DataTypes.Date) {
      return <span>{data instanceof Date ? formatRelativeDate(data) : ''}</span>;
    } else if (column.type === DataTypes.Location) {
      return <TextCellInput value={String(data)} onChange={onChange} />;
    } else if (
      column.type === DataTypes.SingleSelection ||
      column.type === DataTypes.MultipleSelection
    ) {
      if (data instanceof Array) {
        return (
          <span>
            {data.map((unit) => (
              <span>{String(unit)}</span>
            ))}
          </span>
        );
      } else {
        return <span></span>;
      }
    } else if (column.type === DataTypes.List) {
      return <span>List</span>;
    } else if (column.type === DataTypes.RelationOne || column.type === DataTypes.RelationMany) {
      return <span>Relational</span>;
    } else {
      return <span>Unknown Data Type</span>;
    }
  };

  const displayComponent = isHeader ? (
    <TextCellInput value={column.name} onChange={onChange} />
  ) : (
    getCellComponent()
  );

  return <div className={classes.container}>{displayComponent}</div>;
}
