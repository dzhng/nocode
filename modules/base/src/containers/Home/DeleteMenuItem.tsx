import { forwardRef, useState, useCallback } from 'react';
import {
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from '@mui/material';

interface PropTypes {
  deleteWorkspace(): void;
  onClick(): void;
  className?: string;
}

export default forwardRef(function DeleteMenuItem(
  { deleteWorkspace, onClick, className }: PropTypes,
  ref,
) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleClick = useCallback(() => {
    setConfirmOpen(true);
  }, []);

  const handleCancel = useCallback(() => {
    setConfirmOpen(false);
    onClick();
  }, [onClick]);

  const handleConfirm = useCallback(() => {
    deleteWorkspace();
    setConfirmOpen(false);
    onClick();
  }, [onClick, deleteWorkspace]);

  return (
    <>
      <MenuItem
        ref={ref as React.RefObject<HTMLLIElement>}
        className={className}
        onClick={handleClick}
      >
        Delete Workspace
      </MenuItem>
      <Dialog
        open={confirmOpen}
        onClose={handleCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle>Delete Workspace?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Deleting a workspace will delete it for all members. You will lose all content in the
            workspace.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirm} color="primary" variant="contained" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
});
