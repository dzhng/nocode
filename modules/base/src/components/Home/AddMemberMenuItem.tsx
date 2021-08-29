import { forwardRef, useState, useCallback } from 'react';
import {
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  CircularProgress,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { UserDetails } from 'shared/schema';
import MembersField from './MembersField';

interface PropTypes {
  members: UserDetails[];
  addMembers(emails: string[]): Promise<void>;
  removeMembers(ids: string[]): Promise<void>;
  className?: string;
}

const useStyles = makeStyles((theme) =>
  createStyles({
    dialogContent: {
      paddingTop: 0,
    },
    alert: {
      marginTop: theme.spacing(2),
    },
  }),
);

export function AddMemberDialog({
  open,
  setOpen,
  addMembers,
  removeMembers,
  members,
  onFinished,
}: PropTypes & { open: boolean; setOpen(open: boolean): void; onFinished?(): void }) {
  const classes = useStyles();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [removedUsers, setRemovedUsers] = useState<UserDetails[]>([]);
  const [addedEmails, setAddedEmails] = useState<string[]>([]);

  const handleMembersChange = useCallback(
    (_addedEmails: string[], _removedUsers: UserDetails[]) => {
      setRemovedUsers(_removedUsers);
      setAddedEmails(_addedEmails);
    },
    [],
  );

  const handleCancel = useCallback(() => {
    // don't allow cancel while you are submitting
    if (isSubmitting) {
      return;
    }

    setOpen(false);
    onFinished?.();
  }, [isSubmitting, onFinished, setOpen]);

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    if (removedUsers.length > 0) {
      await removeMembers(removedUsers.map((u) => u.id ?? ''));
    }

    if (addedEmails.length > 0) {
      await addMembers(addedEmails);
    }

    setIsSubmitting(false);
    setOpen(false);
    onFinished?.();
  }, [isSubmitting, onFinished, setOpen, removeMembers, addMembers, removedUsers, addedEmails]);

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle>Manage Workspace Members</DialogTitle>

      <DialogContent className={classes.dialogContent}>
        <DialogContentText>
          Workspace members will be able to access all content in this workspace. We will send them
          an invite email to new members to register for Aomni.
        </DialogContentText>
        <MembersField users={members} onChange={handleMembersChange} />
        {(addedEmails.length > 0 || removedUsers.length > 0) && (
          <Alert severity="info" className={classes.alert}>
            Saving will{' '}
            {addedEmails.length > 0 &&
              `add ${addedEmails.length} member${addedEmails.length > 1 ? 's' : ''}`}
            {addedEmails.length > 0 && removedUsers.length > 0 ? ' and ' : ''}
            {removedUsers.length > 0 &&
              `remove ${removedUsers.length} member${removedUsers.length > 1 ? 's' : ''}`}
            .
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button disabled={isSubmitting} onClick={handleCancel} color="primary">
          Cancel
        </Button>
        <Button
          color="primary"
          variant="contained"
          disabled={isSubmitting}
          autoFocus
          onClick={handleSubmit}
        >
          {isSubmitting ? <CircularProgress color="inherit" size={'1.5rem'} /> : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default forwardRef(function AddMemberMenuItem(
  {
    addMembers,
    removeMembers,
    members,
    onClick,
    className,
  }: PropTypes & {
    onClick(): void;
  },
  ref,
) {
  const [formOpen, setFormOpen] = useState(false);

  const handleClick = useCallback(() => {
    setFormOpen(true);
  }, []);

  return (
    <>
      <MenuItem
        ref={ref as React.RefObject<HTMLLIElement>}
        className={className}
        onClick={handleClick}
      >
        Manage Workspace Members
      </MenuItem>
      <AddMemberDialog
        open={formOpen}
        setOpen={setFormOpen}
        addMembers={addMembers}
        removeMembers={removeMembers}
        members={members}
        onFinished={onClick}
      />
    </>
  );
});
