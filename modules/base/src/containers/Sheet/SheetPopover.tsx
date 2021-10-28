import { Box, Popover, TextField, Divider, Button } from '@mui/material';
import { Sheet } from 'shared/schema';
import { DeleteIcon, DuplicateIcon } from '~/components/Icons';

const ButtonIconSx = { width: 15, height: 15, mr: 0.5 };

export default function SheetPopover({
  sheet,
  anchorEl,
  onNameChange,
  onClose,
  onDuplicate,
  onDelete,
}: {
  sheet?: Sheet | null;
  anchorEl?: Element | null;
  onNameChange(name: string): void;
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
        <TextField
          autoFocus
          fullWidth
          value={sheet?.name ?? ''}
          label="Sheet name"
          size="small"
          onChange={(e) => onNameChange(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && onClose()}
        />
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
            <DuplicateIcon sx={ButtonIconSx} />
            Make a copy
          </Button>
          <Button variant="outlined" color="error" onClick={onDelete}>
            <DeleteIcon sx={ButtonIconSx} />
            Delete
          </Button>
        </Box>
      </Box>
    </Popover>
  );
}
