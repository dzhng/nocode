import { useState, useCallback, useEffect } from 'react';
import { Box, Popover, TextField, Divider, Button } from '@mui/material';
import { DataTypes } from 'shared/schema';
import { SortIcon, FilterIcon, HideIcon, ConvertIcon } from '~/components/Icons';
import useSheetContext from '../Context';

const ButtonIconSx = { width: 15, height: 15, mr: 1 };

export default function FieldPopover({
  anchorEl,
  onClose,
}: {
  anchorEl?: Element | null;
  onClose(): void;
}) {
  const { sheet, addField, generateFieldId } = useSheetContext();
  const [name, setName] = useState('');
  const shouldOpen = !!anchorEl;

  // reset name state everytime the popover opens
  useEffect(() => {
    if (shouldOpen) {
      setName('');
    }
  }, [shouldOpen]);

  const handleNameChange = useCallback((newName: string) => {
    setName(newName);
  }, []);

  const handleAddField = useCallback(() => {
    addField(
      {
        id: generateFieldId(),
        name,
        type: DataTypes.Text,
      },
      sheet.fields.length,
    );

    onClose();
  }, [addField, name, generateFieldId, sheet, onClose]);

  return (
    <Popover
      open={shouldOpen}
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
          padding: 2,
        }}
      >
        <TextField
          autoFocus
          fullWidth
          value={name}
          label="Field name"
          size="small"
          onChange={(e) => handleNameChange(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddField()}
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
          <Button color="primary">
            <ConvertIcon sx={ButtonIconSx} />
            Change Field Type
          </Button>
        </Box>
      </Box>
    </Popover>
  );
}
