import { makeStyles, createStyles } from '@material-ui/core/styles';

import LeftBar from '~/components/LeftBar';
import RightBar from '~/components/RightBar';

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
    center: {
      height: '100%',
      flexGrow: 1,
    },
    right: {
      flexGrow: 0,
      flexShrink: 0,
      width: 200,
      backgroundColor: '#CCC',
    },
  }),
);

export default function Home() {
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <div className={classes.navBar}>
        <img className={classes.logo} src="/logo.png" />
      </div>
      <div className={classes.content}>
        <LeftBar />
        <div className={classes.center}></div>
        <RightBar />
      </div>
    </div>
  );
}
