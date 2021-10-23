import React, { useCallback } from 'react';
import * as yup from 'yup';
import { Typography, Button, CircularProgress, Paper } from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import { Formik, Form, Field } from 'formik';
import { TextField } from 'formik-material-ui';
import BackButton from '~/components/BackButton';

const FormSchema = yup.object().shape({
  name: yup.string().min(1, 'Too Short!').max(50, 'Too Long!').required(),
});

const initialValues = {
  name: '',
};

const useStyles = makeStyles((theme) =>
  createStyles({
    container: {
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',

      '& >a': {
        position: 'fixed',
        top: theme.spacing(1),
        left: theme.spacing(1),
      },
    },
    paper: {
      ...theme.customMixins.modalPaper,
      padding: theme.spacing(3),
      marginLeft: 'auto',
      marginRight: 'auto',

      [theme.breakpoints.up('sm')]: {
        minWidth: 500,
      },

      '& h1,p': {
        marginBottom: theme.spacing(1),
      },
    },
    submitButton: {
      marginTop: theme.spacing(3),
      height: 42,
    },
  }),
);

const AppForm = ({ isSubmitting }: { isSubmitting: boolean }) => {
  const classes = useStyles();
  return (
    <Paper className={classes.paper}>
      <Typography variant="h1">Create a new App</Typography>
      <Typography variant="body1">An app is a container for all your data and UI.</Typography>
      <Field
        component={TextField}
        name="name"
        type="text"
        label="Name"
        placeholder="What is this app about?"
        fullWidth
        margin="normal"
        variant="outlined"
        InputLabelProps={{
          shrink: true,
        }}
      />

      <Button
        fullWidth
        className={classes.submitButton}
        size="large"
        type="submit"
        variant="contained"
        color="primary"
        disabled={isSubmitting}
      >
        {isSubmitting ? <CircularProgress size={'1.5rem'} /> : 'Create'}
      </Button>
    </Paper>
  );
};

interface PropTypes {
  save(values: { name: string }): Promise<void>;
}

export default function CreateContainer({ save }: PropTypes) {
  const classes = useStyles();

  const submit = useCallback(
    (values, { setSubmitting }) => {
      setSubmitting(true);
      // just keep showing submit spinner even after created since we'll nav to new page
      // hide if error though
      save(values).catch(() => setSubmitting(false));
    },
    [save],
  );

  return (
    <div className={classes.container}>
      <BackButton />
      <Formik initialValues={initialValues} validationSchema={FormSchema} onSubmit={submit}>
        {({ isSubmitting }) => (
          <Form>
            <AppForm isSubmitting={isSubmitting} />
          </Form>
        )}
      </Formik>
    </div>
  );
}
