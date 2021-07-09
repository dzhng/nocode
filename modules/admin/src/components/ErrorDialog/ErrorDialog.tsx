import React from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  DialogContentText,
} from '@material-ui/core';

import { useAppState } from '~/hooks/useAppState';

export default function ErrorDialog() {
  const { error, setError } = useAppState();

  const message: string | null = error instanceof Error ? error.message : error;

  return (
    <Dialog open={error !== null} onClose={() => setError(null)} fullWidth={true} maxWidth="xs">
      <DialogTitle>ERROR</DialogTitle>
      <DialogContent>
        <DialogContentText data-testid="content-text">{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setError(null)} color="primary" autoFocus>
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
}
