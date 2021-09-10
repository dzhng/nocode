import { forwardRef, useState, useCallback } from 'react';
import {
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from '@material-ui/core';

interface PropTypes {
  leaveWorkspace(): void;
  onClick(): void;
  className?: string;
}

export default forwardRef(function LeaveMenuItem(
  { leaveWorkspace, onClick, className }: PropTypes,
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
    leaveWorkspace();
    setConfirmOpen(false);
    onClick();
  }, [onClick, leaveWorkspace]);

  return (
    <>
      <MenuItem
        ref={ref as React.RefObject<HTMLLIElement>}
        className={className}
        onClick={handleClick}
      >
        Leave Workspace
      </MenuItem>
      <Dialog
        open={confirmOpen}
        onClose={handleCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle>Leave Workspace?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You can be invited back to the workspace after leaving. This will not affect other
            members in the workspace.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirm} color="primary" variant="contained" autoFocus>
            Leave
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
});
