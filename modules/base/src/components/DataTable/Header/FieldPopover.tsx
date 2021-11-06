import { useCallback } from 'react';
import { Box, Popover, TextField, Divider, Button } from '@mui/material';
import { FieldType } from 'shared/schema';
import {
  DeleteIcon,
  MoveLeftIcon,
  MoveRightIcon,
  SortIcon,
  FilterIcon,
  HideIcon,
  ConvertIcon,
} from '~/components/Icons';
import useSheetContext from '../Context';

const ButtonIconSx = { width: 15, height: 15, mr: 1 };

export default function FieldPopover({
  field,
  anchorEl,
  canMoveLeft,
  canMoveRight,
  onMoveLeft,
  onMoveRight,
  onClose,
}: {
  field?: FieldType | null;
  anchorEl?: Element | null;
  canMoveLeft: boolean;
  canMoveRight: boolean;
  onMoveLeft(): void;
  onMoveRight(): void;
  onClose(): void;
}) {
  const { changeField, removeField } = useSheetContext();

  const handleNameChange = useCallback(
    (newName: string) => {
      if (field) {
        changeField(field.id, { name: newName });
      }
    },
    [changeField, field],
  );

  const handleDelete = useCallback(() => {
    if (field) {
      removeField(field.id);
    }
  }, [removeField, field]);

  return (
    <Popover
      open={!!field}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
    >
      <Box
        sx={{
          width: 200,
          padding: 2,
        }}
      >
        <TextField
          autoFocus
          fullWidth
          value={field?.name ?? ''}
          label="Field name"
          size="small"
          onChange={(e) => handleNameChange(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && onClose()}
        />
        <Divider sx={{ mt: 1, mb: 1 }} />
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            '> button': {
              textTransform: 'none',
              justifyContent: 'left',
            },
          }}
        >
          {canMoveLeft && (
            <Button color="primary" onClick={onMoveLeft}>
              <MoveLeftIcon sx={ButtonIconSx} />
              Move Left
            </Button>
          )}
          {canMoveRight && (
            <Button color="primary" onClick={onMoveRight}>
              <MoveRightIcon sx={ButtonIconSx} />
              Move Right
            </Button>
          )}

          <Button color="primary">
            <SortIcon sx={ButtonIconSx} />
            Sort Field
          </Button>
          <Button color="primary">
            <FilterIcon sx={ButtonIconSx} />
            Filter By Field
          </Button>
          <Button color="primary">
            <HideIcon sx={ButtonIconSx} />
            Hide Field
          </Button>
          <Button color="error" onClick={handleDelete}>
            <DeleteIcon sx={ButtonIconSx} />
            Remove Field
          </Button>
        </Box>
      </Box>
    </Popover>
  );
}
