import { makeStyles, createStyles } from '@material-ui/core/styles';
import clsx from 'clsx';

const NavBarHeight = 40;

const useStyles = makeStyles((theme) =>
  createStyles({
    container: {
      width: '100%',
      height: '100%',
    },
    navBar: {
      width: '100%',
      borderBottom: theme.dividerBorder,
      height: NavBarHeight,
    },
    logo: {
      height: NavBarHeight - 10,
      margin: 5,
    },
    content: {
      height: `calc(100% - ${NavBarHeight}px)`,
      display: 'flex',
    },
    section: {
      height: '100%',
    },
    center: {
      flexGrow: 1,
    },
    left: {
      flexGrow: 0,
      flexShrink: 0,
      width: 100,
      backgroundColor: '#CCC',
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
        <div className={clsx(classes.left, classes.section)}></div>
        <div className={clsx(classes.center, classes.section)}></div>
        <div className={clsx(classes.right, classes.section)}></div>
      </div>
    </div>
  );
}
