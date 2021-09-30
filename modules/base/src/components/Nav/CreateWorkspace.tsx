import { useCallback, useState } from 'react';
import {
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import useGlobalState from '~/hooks/useGlobalState';

export default function CreateWorkspace({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose(): void;
  onCreate(): void;
}) {
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const { createWorkspace } = useGlobalState();

  const handleCreateWorkspace = useCallback(() => {
    createWorkspace(newWorkspaceName);
    onClose();
    onCreate();
  }, [newWorkspaceName, createWorkspace, onClose, onCreate]);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Create New Workspace</DialogTitle>
      <DialogContent>
        <DialogContentText>
          A workspace allows you to collaborate with a group of co-workers.
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          id="name"
          label="Workspace Name"
          type="text"
          fullWidth
          value={newWorkspaceName}
          onChange={(e) => setNewWorkspaceName(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleCreateWorkspace} color="primary">
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}
