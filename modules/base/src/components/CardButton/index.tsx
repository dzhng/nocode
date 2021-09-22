import { createStyles, makeStyles } from '@mui/styles';
import { Typography, Card } from '@mui/material';

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
  }),
);

export default function CardButton({
  height,
  title,
  icon,
  ...props
}: {
  height: number;
  title: string;
  icon: React.ReactNode;
  [props: string]: any;
}) {
  const classes = useStyles();

  return (
    <Card className={classes.card} style={{ height }} {...props}>
      <Typography variant="h2">{title}</Typography>
      {icon}
    </Card>
  );
}
