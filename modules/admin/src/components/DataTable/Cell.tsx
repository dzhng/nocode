import { makeStyles, createStyles } from '@material-ui/core/styles';
import { formatRelativeDate } from 'nocode-shared/utils';
import { DataTypes, CellType, ColumnType, RowType } from '~/types';

interface PropTypes {
  column: ColumnType;
  data?: CellType;
  isHeader?: boolean;
}

const useStyles = makeStyles((theme) =>
  createStyles({
    container: {
      width: '100%',
      height: '100%',
    },
  }),
);

export default function Cell({ column, data, isHeader }: PropTypes) {
  const classes = useStyles();

  const getCellComponent = (): JSX.Element => {
    if (!data) {
      return <span></span>;
    }

    if (column.type === DataTypes.Text) {
      return <span>String(data)</span>;
    } else if (column.type === DataTypes.Image) {
      return <span>Image</span>; // TODO
    } else if (column.type === DataTypes.Number) {
      return <span>String(data)</span>;
    } else if (column.type === DataTypes.File) {
      return <span>File</span>; // TODO
    } else if (column.type === DataTypes.Date) {
      return <span>{data instanceof Date ? formatRelativeDate(data) : ''}</span>;
    } else if (column.type === DataTypes.Location) {
      return <span>String(data)</span>; // TODO
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

  const displayComponent = isHeader ? <span>column.name</span> : getCellComponent();

  return <div className={classes.container}>{displayComponent}</div>;
}
