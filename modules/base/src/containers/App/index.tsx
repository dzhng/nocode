import { useState } from 'react';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import { AppBar, Toolbar, Typography, IconButton, Tooltip } from '@material-ui/core';
import {
  GridOnOutlined as SheetIcon,
  ViewDayOutlined as ViewIcon,
  SettingsOutlined as AutomateIcon,
} from '@material-ui/icons';
import { clone } from 'lodash';
import { DataTypes, ColumnType, RowType, CellType } from '~/types';
import DataTable from '~/components/DataTable';
import BackButton from '~/components/BackButton';

const useStyles = makeStyles((theme) =>
  createStyles({
    container: {
      width: '100%',
      height: '100%',
      marginTop: theme.headerBarHeight,
    },
    navBar: {
      width: '100%',
      borderBottom: theme.dividerBorder,
      height: theme.headerBarHeight,
    },
    centerButtons: {
      marginLeft: 'auto',
      marginRight: 'auto',
    },
    content: {
      height: '100%',
      display: 'flex',
    },
  }),
);

export default function AppContainer() {
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
    <>
      <AppBar position="fixed" color="transparent">
        <Toolbar>
          <BackButton />
          <Typography variant="h1">Hello World</Typography>

          <div className={classes.centerButtons}>
            <Tooltip title="Database" placement="bottom">
              <IconButton>
                <SheetIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Views" placement="bottom">
              <IconButton>
                <ViewIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Automations" placement="bottom">
              <IconButton>
                <AutomateIcon />
              </IconButton>
            </Tooltip>
          </div>
        </Toolbar>
      </AppBar>
      <div className={classes.container}>
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
      </div>
    </>
  );
}
