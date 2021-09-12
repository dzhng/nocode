import { useState } from 'react';
import { clone } from 'lodash';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import { DataTypes, ColumnType, Record, CellType } from 'shared/schema';
import useApp from '~/hooks/useApp';
import DataTable from '~/components/DataTable';

const useStyles = makeStyles(() =>
  createStyles({
    content: {
      height: '100%',
      display: 'flex',
    },
  }),
);

export default function SheetContainer({ appId }: { appId: number }) {
  const classes = useStyles();
  const { sheets, isLoadingSheets, createSheet } = useApp(appId);

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

  const [data, setData] = useState<Record[]>([{ _id: '1', '1': 'Jay-Z', '2': 1, '3': new Date() }]);

  const addColumn = (type: ColumnType) => {
    setColumns([...columns, type]);
  };

  const addRow = (index: number) => {
    const cloned = clone(data);
    cloned.splice(index, 0, { _id: String(Math.floor(Math.random() * 100000)) });
    setData(cloned);
  };

  const changeCell = (location: { columnID: string; rowID?: string }, value?: CellType) => {
    const newData = clone(data);
    const row = newData.find((aRow) => aRow._id === location.rowID);
    if (row) {
      row[location.columnID] = value;
      setData(newData);
    }
  };

  const changeColumn = (columnID: string, newData: { name: string; type: DataTypes }) => {
    const cloned = clone(columns);
    const column = cloned.find((c) => c.columnID === columnID);
    if (column) {
      column.name = newData.name;
      column.type = newData.type;
    }
    setColumns(cloned);
  };

  return (
    <div className={classes.content}>
      <DataTable
        columns={columns}
        data={data}
        addColumn={addColumn}
        addRow={addRow}
        changeCell={changeCell}
        changeColumn={changeColumn}
      />
    </div>
  );
}
