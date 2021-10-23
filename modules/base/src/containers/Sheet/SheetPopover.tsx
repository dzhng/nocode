import { Box, Popover, TextField, Divider, Button } from '@mui/material';
import { Sheet } from 'shared/schema';

export default function SheetPopover({
  sheet,
  anchorEl,
  onClose,
  onDuplicate,
  onDelete,
}: {
  sheet?: Sheet | null;
  anchorEl?: Element | null;
  onClose(): void;
  onDuplicate(): void;
  onDelete(): void;
}) {
  return (
    <Popover
      open={!!sheet}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
    >
      <Box
        sx={{
          padding: 2,
        }}
      >
        <TextField autoFocus fullWidth value={sheet?.name} label="Sheet name" size="small" />
        <Divider sx={{ mt: 1, mb: 1 }} />
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            '> button': {
              mr: 1,
            },
          }}
        >
          <Button variant="outlined" color="primary" onClick={onDuplicate}>
            Duplicate
          </Button>
          <Button variant="outlined" color="error" onClick={onDelete}>
            Delete
          </Button>
        </Box>
      </Box>
    </Popover>
  );
}
