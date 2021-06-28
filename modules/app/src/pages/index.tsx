import { makeStyles, createStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() =>
  createStyles({
    container: {
      width: '100%',
      height: '100%',
    },
    navBar: {
      width: '100%',
      height: 50,
    },
    logo: {
      height: 40,
      marginTop: 5,
      marginBottom: 5,
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
    </div>
  );
}
