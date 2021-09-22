import { makeStyles, createStyles } from '@mui/styles';
import { Typography, Paper, Container } from '@mui/material';
import { Logo } from '~/components/Icons';

const useStyles = makeStyles((theme) =>
  createStyles({
    container: {
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    paper: {
      display: 'flex',
      alignItems: 'center',
      flexDirection: 'column',
      padding: '2em',
      textAlign: 'center',

      '& p': {
        marginBottom: theme.spacing(1),
      },
      '& hr': {
        width: '96%',
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
      },
    },
    logo: {
      marginBottom: theme.spacing(1),
      maxWidth: 120,
      marginLeft: 'auto',
      marginRight: 'auto',
    },
  }),
);

export default function RegisterConfirmPage() {
  const classes = useStyles();

  return (
    <Container maxWidth="xs" className={classes.container}>
      <Paper elevation={3} className={classes.paper}>
        <Logo className={classes.logo} />
        <Typography variant="body1">Check your email to confirm you user registration.</Typography>
      </Paper>
    </Container>
  );
}
