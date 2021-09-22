import { makeStyles, createStyles } from '@mui/styles';

const useStyles = makeStyles(() =>
  createStyles({
    container: {
      height: '100%',
      flexGrow: 0,
      flexShrink: 0,
      width: 50,
      backgroundColor: '#CCC',
    },
  }),
);

export default function LeftBar() {
  const classes = useStyles();

  return <div className={classes.container} />;
}
