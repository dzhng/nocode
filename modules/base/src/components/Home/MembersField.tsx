import React, { useState, useCallback, useEffect, useRef } from 'react';
import { includes, trim, without } from 'lodash';
import clsx from 'clsx';
import * as Yup from 'yup';
import { Paper, InputBase, IconButton } from '@material-ui/core';
import { Autocomplete, createFilterOptions } from '@material-ui/lab';
import { Add as AddIcon, HighlightOff as RemoveIcon } from '@material-ui/icons';
import { createStyles, makeStyles, styled, Theme } from '@material-ui/core/styles';
import { shortName } from 'shared/utils';
import { LocalModel, User } from 'shared/schema';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    itemPaper: {
      marginTop: theme.spacing(2),
      padding: '2px 4px',
      display: 'flex',
      alignItems: 'center',
    },
    memberItem: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
      backgroundColor: theme.palette.background.default,
    },
    input: {
      marginLeft: theme.spacing(1),
      flex: 1,
    },
    iconButton: {
      padding: 3,
      marginRight: theme.spacing(1),
    },
  }),
);

const EmailError = styled('div')(({ theme }) => ({
  color: theme.palette.warning.main,
}));

const MemberItem = ({
  title,
  value,
  remove,
}: {
  title: string;
  value: any;
  remove(value: any): void;
}) => {
  const classes = useStyles();

  return (
    <Paper elevation={0} className={clsx(classes.memberItem, classes.itemPaper)}>
      <InputBase className={classes.input} value={title} data-testid="email-item" />
      <IconButton
        data-testid="remove-button"
        className={classes.iconButton}
        onClick={() => remove(value)}
      >
        <RemoveIcon />
      </IconButton>
    </Paper>
  );
};

interface EmailOptionType {
  title: string;
  inputValue?: string;
}

const emailSchema = Yup.string().email().required();
const filter = createFilterOptions<EmailOptionType>();

const EmailTextField = ({
  values,
  pushEmail,
}: {
  values: string[];
  pushEmail(email: string): void;
}) => {
  const classes = useStyles();
  const inputRef = useRef<HTMLInputElement>();
  const [error, setError] = useState<string | null>(null);
  const [key, setKey] = useState(0);

  const submitEmail = useCallback(
    (text) => {
      const email = trim(text);

      if (includes(values, email)) {
        setError('This email has already been added');
      } else if (emailSchema.isValidSync(email)) {
        pushEmail(email);
        setError(null);

        // HACK:
        // there is a bug/issue with autocomplete where the
        // previously submitted inputValue will reappear
        // on blur. Setting inputValue/onChange does not
        // fix this issue, must be some internal state that
        // keeps the old value.
        //
        // We get around this by forcing autocomplete to
        // rerender via a key prop that changes on submit
        setKey((state) => state + 1);
      } else {
        setError('You must provide a valid email');
      }

      // either way, make sure to focus back on input
      // need setTimeout here since we rerender autocomplete component via key
      setTimeout(() => {
        inputRef.current?.focus();
      });
    },
    [setError, pushEmail, values],
  );

  useEffect(() => {
    inputRef.current?.focus();
  }, [inputRef]);

  return (
    <>
      <Autocomplete
        key={key}
        freeSolo
        handleHomeEndKeys
        autoHighlight
        options={[] as EmailOptionType[]}
        onChange={(_, newValue) => {
          if (typeof newValue === 'string') {
            submitEmail(newValue);
          } else if (newValue) {
            const email = newValue.inputValue;
            submitEmail(email);
          }
        }}
        filterOptions={(options, state) => {
          const filtered = filter(options, state);

          // Suggest the creation of a new value
          if (state.inputValue !== '') {
            filtered.push({
              title: `Add "${state.inputValue}"`,
              inputValue: state.inputValue,
            });
          }

          return filtered;
        }}
        getOptionLabel={(option) => {
          // Value selected with enter, right from the input
          if (typeof option === 'string') {
            return option;
          }
          // Add "xxx" option created dynamically
          if (option.inputValue) {
            return option.inputValue;
          }
          // Regular option
          return option.title;
        }}
        renderOption={(option) => (
          <>
            <AddIcon className={classes.iconButton} />
            {option.title}
          </>
        )}
        renderInput={(params) => (
          <Paper variant="outlined" className={classes.itemPaper} ref={params.InputProps.ref}>
            <InputBase
              className={classes.input}
              inputProps={params.inputProps}
              placeholder="Add members"
              inputRef={inputRef}
              data-testid="email-input"
            />
          </Paper>
        )}
      />
      <EmailError data-testid="email-error">{error}</EmailError>
    </>
  );
};

export default function MembersField({
  users,
  onChange,
}: {
  users: LocalModel<User>[];
  onChange(addedEmails: string[], removedUsers: LocalModel<User>[]): void;
}) {
  const [removedUsers, setRemovedUsers] = useState<LocalModel<User>[]>([]);
  const [addedEmails, setAddedEmails] = useState<string[]>([]);
  const [currentUsers, setCurrentUsers] = useState<LocalModel<User>[]>(users);

  const removeUser = useCallback(
    (userId: string) => {
      const user = currentUsers.find((u) => u.id === userId);
      if (user) {
        const newRemovedUsers = [...removedUsers, user];
        setRemovedUsers(newRemovedUsers);
        setCurrentUsers(without(currentUsers, user));
        onChange(addedEmails, newRemovedUsers);
      }
    },
    [currentUsers, onChange, addedEmails, removedUsers],
  );

  const removeAddedEmail = useCallback(
    (email: string) => {
      const newAddedEmails = without(addedEmails, email);
      setAddedEmails(newAddedEmails);
      onChange(newAddedEmails, removedUsers);
    },
    [onChange, addedEmails, removedUsers],
  );

  const addUser = useCallback(
    (email: string) => {
      const newAddedEmails = [...addedEmails, email];
      setAddedEmails(newAddedEmails);
      onChange(newAddedEmails, removedUsers);
    },
    [onChange, addedEmails, removedUsers],
  );

  const emails: string[] = currentUsers.map((user) => user.email ?? '').concat(addedEmails);

  return (
    <>
      {currentUsers.map((user) => (
        <MemberItem
          key={user.id}
          title={`${shortName(user.displayName)} (${user.email})`}
          value={user.id}
          remove={removeUser}
        />
      ))}
      {addedEmails.map((email) => (
        <MemberItem key={email} title={email} value={email} remove={removeAddedEmail} />
      ))}
      <EmailTextField pushEmail={addUser} values={emails} />
    </>
  );
}
