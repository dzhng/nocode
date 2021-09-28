import { useState } from 'react';
import { makeStyles, createStyles } from '@mui/styles';
import { AppBar, Toolbar, Typography, IconButton, Tooltip } from '@mui/material';
import {
  GridOnOutlined as SheetIcon,
  ViewDayOutlined as ViewIcon,
  SettingsOutlined as AutomateIcon,
} from '@mui/icons-material';
import BackButton from '~/components/BackButton';
import SheetContainer from '~/containers/Sheet';
import PageContainer from '~/containers/Page';
import AutomationContainer from '~/containers/Automation';

const useStyles = makeStyles((theme) =>
  createStyles({
    container: {
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    },
    appBar: {
      flexShrink: 0,
      borderBottom: theme.dividerBorder,
      backgroundColor: 'white',
    },
    centerButtons: {
      marginLeft: 'auto',
      marginRight: 'auto',
    },
    content: {
      flexGrow: 1,
      marginTop: theme.headerBarHeight,
      padding: theme.spacing(1),
      overflow: 'hidden',
    },
  }),
);

export default function App({ appId }: { appId: number }) {
  const classes = useStyles();
  const [tab, setTab] = useState<'sheet' | 'page' | 'automation'>('sheet');

  return (
    <div className={classes.container}>
      <AppBar
        className={classes.appBar}
        position="fixed"
        color="transparent"
        sx={{ height: (theme) => theme.headerBarHeight + 1 }}
        elevation={0}
      >
        <Toolbar>
          <BackButton />
          <Typography variant="h1">Hello World</Typography>

          <div className={classes.centerButtons}>
            <Tooltip title="Database" placement="bottom">
              <IconButton
                color={tab === 'sheet' ? 'primary' : 'default'}
                onClick={() => setTab('sheet')}
              >
                <SheetIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Pages" placement="bottom">
              <IconButton
                color={tab === 'page' ? 'primary' : 'default'}
                onClick={() => setTab('page')}
              >
                <ViewIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Automations" placement="bottom">
              <IconButton
                color={tab === 'automation' ? 'primary' : 'default'}
                onClick={() => setTab('automation')}
              >
                <AutomateIcon />
              </IconButton>
            </Tooltip>
          </div>
        </Toolbar>
      </AppBar>

      <div className={classes.content}>
        {tab === 'sheet' && <SheetContainer appId={appId} />}
        {tab === 'page' && <PageContainer />}
        {tab === 'automation' && <AutomationContainer />}
      </div>
    </div>
  );
}
