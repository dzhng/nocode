import { makeStyles, createStyles } from '@mui/styles';

const useStyles = makeStyles(() =>
  createStyles({
    container: {
      height: '100%',
      flexGrow: 0,
      flexShrink: 0,
      width: 200,
      backgroundColor: '#CCC',
    },
  }),
);

export default function RightBar() {
  const classes = useStyles();

  return <div className={classes.container} />;
}
