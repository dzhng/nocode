import { useState, useCallback } from 'react';
import Link from 'next/link';
import * as yup from 'yup';
import { useRouter } from 'next/router';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import { ErrorOutline as ErrorIcon } from '@material-ui/icons';
import { Divider, Typography, Button, Paper, Container, CircularProgress } from '@material-ui/core';
import { Formik, Form, Field } from 'formik';
import { TextField } from 'formik-material-ui';

import { useAppState } from '~/hooks/useAppState';
import LoadingContainer from '~/containers/Loading';
import { Logo } from '~/components/Icons';

const FormSchema = yup.object().shape({
  email: yup.string().email().required(),
  password: yup
    .string()
    .min(6, 'Your password is too short, please enter a minimum of 6 characters.')
    .max(50, 'Your password is too long.')
    .required(),
});

const initialValues = {
  email: '',
  password: '',
};

// eslint-disable-next-line @next/next/no-img-element
const GoogleLogo = <img src="/google-logo.svg" />;

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
    button: {
      color: 'black',
      fontSize: '1.1rem',
      background: 'white',
      margin: '0.8em 0 0.7em',
      textTransform: 'none',
    },
    errorMessage: {
      color: 'red',
      display: 'flex',
      alignItems: 'center',

      '& svg': {
        marginRight: '0.4em',
      },
    },
  }),
);

const LoginForm = ({ isSubmitting }: { isSubmitting: boolean }) => {
  const classes = useStyles();
  return (
    <>
      <Field
        component={TextField}
        aria-describedby="email address"
        name="email"
        type="email"
        label="Email"
        placeholder="Email"
        fullWidth
        margin="normal"
        variant="outlined"
        InputLabelProps={{
          shrink: true,
        }}
      />

      <Field
        component={TextField}
        aria-describedby="password"
        name="password"
        type="password"
        label="Password"
        placeholder="Password"
        fullWidth
        margin="normal"
        variant="outlined"
        InputLabelProps={{
          shrink: true,
        }}
      />

      <Button
        fullWidth
        className={classes.button}
        size="large"
        type="submit"
        variant="outlined"
        color="primary"
        disabled={isSubmitting}
      >
        {isSubmitting ? <CircularProgress size={'1.5rem'} /> : 'Sign In'}
      </Button>
    </>
  );
};

export default function LoginPage({ previousPage }: { previousPage?: string }) {
  const classes = useStyles();
  const router = useRouter();
  const { signInWithEmailAndPassword, isAuthReady, signInWithGoogle } = useAppState();
  const [authError, setAuthError] = useState<Error | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const login = useCallback(
    (values: { email: string; password: string }, { setSubmitting }) => {
      setAuthError(null);
      setSubmitting(true);
      setIsAuthenticating(true);

      signInWithEmailAndPassword(values.email, values.password)
        .then(() => {
          router.replace(previousPage ?? '/');
        })
        .catch((err) => {
          setAuthError(err);
          setSubmitting(false);
          setIsAuthenticating(false);
        });
    },
    [previousPage, router, signInWithEmailAndPassword],
  );

  const loginWithGoogle = useCallback(() => {
    setAuthError(null);
    setIsAuthenticating(true);
    signInWithGoogle()
      .then(() => {
        router.replace(previousPage ?? '/');
      })
      .catch((err) => {
        setAuthError(err);
        setIsAuthenticating(false);
      });
  }, [previousPage, router, signInWithGoogle]);

  if (!isAuthReady) {
    return <LoadingContainer />;
  }

  return (
    <Container maxWidth="xs" className={classes.container}>
      <Paper elevation={3} className={classes.paper}>
        <Logo className={classes.logo} />
        <Typography variant="body1">Sign in or create a new account to get started.</Typography>

        <Button
          fullWidth
          disabled={isAuthenticating}
          variant="outlined"
          color="primary"
          className={classes.button}
          onClick={loginWithGoogle}
          startIcon={GoogleLogo}
        >
          Sign in with Google
        </Button>

        <Divider />

        <Formik
          initialValues={initialValues}
          validationSchema={FormSchema}
          validateOnChange={false}
          validateOnBlur={false}
          onSubmit={login}
        >
          {({ isSubmitting }) => (
            <Form>
              <LoginForm isSubmitting={isSubmitting} />
            </Form>
          )}
        </Formik>

        {authError && (
          <Typography variant="caption" className={classes.errorMessage}>
            <ErrorIcon />
            {authError.message}
          </Typography>
        )}

        <Divider />

        <Link href="/register" passHref>
          <Button fullWidth color="secondary">
            Register
          </Button>
        </Link>
      </Paper>
    </Container>
  );
}
