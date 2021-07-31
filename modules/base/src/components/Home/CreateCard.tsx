import { Typography, Card } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { AddCircleOutline as AddIcon } from '@material-ui/icons';

const useStyles = makeStyles((theme) =>
  createStyles({
    card: {
      cursor: 'pointer',
      padding: theme.spacing(2),
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.palette.primary.main,
      boxShadow: theme.shadows[5],
      transition: theme.transitionTime,

      '&:hover': {
        backgroundColor: theme.palette.primary.dark,
        boxShadow: theme.shadows[12],
      },

      '& h2': {
        marginBottom: theme.spacing(1),
        fontWeight: 600,
        color: 'white',
        letterSpacing: 0,
      },
    },
    icon: {
      fontSize: '3rem',
      color: 'white',
    },
  }),
);

export default function CreateCard({ height }: { height: number }) {
  const classes = useStyles();

  return (
    <Card className={classes.card} style={{ height }}>
      <Typography variant="h2">New room</Typography>
      <AddIcon className={classes.icon} />
    </Card>
  );
}
