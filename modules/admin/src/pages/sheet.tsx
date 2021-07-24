import { useState } from 'react';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import { cloneDeep } from 'lodash';
import { DataTypes, ColumnType, RowType, CellType } from '~/types';
import DataTable from '~/components/DataTable';

const useStyles = makeStyles((theme) =>
  createStyles({
    container: {
      width: '100%',
      height: '100%',
    },
    navBar: {
      width: '100%',
      borderBottom: theme.dividerBorder,
      height: theme.headerBarHeight,
    },
    logo: {
      height: theme.headerBarHeight - 10,
      margin: 5,
    },
    content: {
      height: `calc(100% - ${theme.headerBarHeight}px)`,
      display: 'flex',
    },
  }),
);

export default function Sheet() {
  const classes = useStyles();

  const [columns, setColumns] = useState<ColumnType[]>([
    {
      columnID: '1',
      name: 'Name',
      type: DataTypes.Text,
    },
    {
      columnID: '2',
      name: 'Peak Chart Position',
      type: DataTypes.Number,
    },
    {
      columnID: '3',
      name: 'Release Date',
      type: DataTypes.Date,
    },
  ]);

  const [data, setData] = useState<RowType[]>([
    { _id: '1', '1': 'Jay-Z', '2': 1, '3': new Date() },
  ]);

  const addColumn = (type: ColumnType) => {
    setColumns([...columns, type]);
  };

  const addRow = (index: number) => {
    setData([...data, { _id: '2' }]);
  };

  const changeCell = (location: { columnID: string; rowID?: string }, value?: CellType) => {
    const newData = cloneDeep(data);
    const row = newData.find((aRow) => aRow._id === location.rowID);
    if (row) {
      row[location.columnID] = value;
      setData(newData); // TODO: need to make immutable value here
    }
  };

  return (
    <div className={classes.container}>
      <div className={classes.navBar}>
        <img className={classes.logo} src="/logo.png" />
      </div>
      <div className={classes.content}>
        <DataTable
          columns={columns}
          data={data}
          addColumn={addColumn}
          addRow={addRow}
          changeCell={changeCell}
        />
      </div>
    </div>
  );
}
