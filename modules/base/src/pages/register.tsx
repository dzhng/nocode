import React, { useState, useCallback } from 'react';
import * as Yup from 'yup';
import { useRouter } from 'next/router';
import {
  makeStyles,
  createStyles,
  Container,
  Paper,
  Button,
  Typography,
  CircularProgress,
} from '@material-ui/core';
import { Formik, Form, Field } from 'formik';
import { TextField } from 'formik-material-ui';
import { ErrorOutline as ErrorIcon } from '@material-ui/icons';
import { useAppState } from '~/state';
import { Logo } from '~/components/Icons';

const FormSchema = Yup.object().shape({
  name: Yup.string().min(1, 'Please enter a valid name').required(),
  email: Yup.string().email().required(),
  password: Yup.string()
    .min(6, 'Your password is too short, please enter a minimum of 6 characters.')
    .max(50, 'Your password is too long.')
    .required(),
});

const initialValues = {
  name: '',
  email: '',
  password: '',
};

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
    },
    logo: {
      marginBottom: theme.spacing(1),
      maxWidth: 120,
      marginLeft: 'auto',
      marginRight: 'auto',
    },
    errorMessage: {
      color: 'red',
      display: 'flex',
      alignItems: 'center',
      '& svg': {
        marginRight: '0.4em',
      },
    },
    button: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
    },
  }),
);

const RegisterForm = ({ isSubmitting }: { isSubmitting: boolean }) => {
  const classes = useStyles();
  return (
    <>
      <Field
        component={TextField}
        aria-describedby="name"
        name="name"
        type="text"
        label="Name"
        placeholder="What is your name?"
        fullWidth
        margin="normal"
        variant="outlined"
        InputLabelProps={{
          shrink: true,
        }}
      />

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
        color="primary"
        size="large"
        type="submit"
        variant="contained"
        disabled={isSubmitting}
      >
        {isSubmitting ? <CircularProgress size={'1.5rem'} /> : 'Register'}
      </Button>
    </>
  );
};

export default function RegisterPage() {
  const classes = useStyles();
  const router = useRouter();

  const { register } = useAppState();
  const [authError, setAuthError] = useState<Error | null>(null);

  const handleSubmit = useCallback(
    (values: { name: string; email: string; password: string }, { setSubmitting }) => {
      setAuthError(null);
      setSubmitting(true);
      register(values.email, values.password, values.name)
        .then(() => {
          router.replace('/');
        })
        .catch((errMsg) => {
          setAuthError(errMsg);
          setSubmitting(false);
        });
    },
    [register, router],
  );

  return (
    <Container maxWidth="xs" className={classes.container}>
      <Paper elevation={3} className={classes.paper}>
        <Logo className={classes.logo} />
        <Typography variant="body1">
          Welcome to the future of virtual meetings. Register for an account to get started.
        </Typography>

        <Formik
          initialValues={initialValues}
          validationSchema={FormSchema}
          validateOnChange={false}
          validateOnBlur={false}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form>
              <RegisterForm isSubmitting={isSubmitting} />
            </Form>
          )}
        </Formik>

        {authError && (
          <Typography variant="caption" className={classes.errorMessage}>
            <ErrorIcon />
            {authError.message}
          </Typography>
        )}
      </Paper>
    </Container>
  );
}
