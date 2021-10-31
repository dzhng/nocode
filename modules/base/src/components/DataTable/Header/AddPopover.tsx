import { useState, useCallback, useEffect } from 'react';
import { Box, Popover, TextField, Divider, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { DataTypes } from 'shared/schema';
import {
  TextTypeIcon,
  NumberTypeIcon,
  SelectionTypeIcon,
  ImageTypeIcon,
  FileTypeIcon,
  DateTypeIcon,
  RelationTypeIcon,
} from '~/components/Icons';
import { FieldNamePlaceholder } from '../const';
import useSheetContext from '../Context';

export default function FieldPopover({
  anchorEl,
  onClose,
}: {
  anchorEl?: Element | null;
  onClose(): void;
}) {
  const { sheet, addField, generateFieldId } = useSheetContext();
  const [name, setName] = useState('');
  const [selectedType, setSelectedType] = useState<DataTypes>(DataTypes.Text);

  const shouldOpen = !!anchorEl;

  // reset name state everytime the popover opens
  useEffect(() => {
    if (shouldOpen) {
      setName('');
      setSelectedType(DataTypes.Text);
    }
  }, [shouldOpen]);

  const handleNameChange = useCallback((newName: string) => {
    setName(newName);
  }, []);

  const handleTypeChange = useCallback((_, newType: DataTypes) => {
    if (newType !== null) {
      setSelectedType(newType);
    }
  }, []);

  const handleAddField = useCallback(() => {
    addField(
      {
        id: generateFieldId(),
        name,
        type: selectedType,
      },
      sheet.fields.length,
    );

    onClose();
  }, [addField, name, selectedType, generateFieldId, sheet, onClose]);

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
          placeholder={FieldNamePlaceholder}
          size="small"
          onChange={(e) => handleNameChange(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddField()}
        />
        <Divider sx={{ mt: 1, mb: 1 }} />
        <ToggleButtonGroup
          fullWidth
          size="small"
          orientation="vertical"
          sx={{
            '> button': {
              textTransform: 'none',
              justifyContent: 'left',

              '> svg': {
                width: 15,
                height: 15,
                mr: 1,
              },
            },
          }}
          value={selectedType}
          exclusive
          onChange={handleTypeChange}
        >
          <ToggleButton value={DataTypes.Text}>
            <TextTypeIcon />
            Text
          </ToggleButton>
          <ToggleButton value={DataTypes.Number}>
            <NumberTypeIcon />
            Number
          </ToggleButton>
          <ToggleButton value={DataTypes.Selection}>
            <SelectionTypeIcon />
            Selection
          </ToggleButton>
          <ToggleButton value={DataTypes.Image}>
            <ImageTypeIcon />
            Image
          </ToggleButton>
          <ToggleButton value={DataTypes.File}>
            <FileTypeIcon />
            File
          </ToggleButton>
          <ToggleButton value={DataTypes.Date}>
            <DateTypeIcon />
            Date and time
          </ToggleButton>
          <ToggleButton value={DataTypes.Relation}>
            <RelationTypeIcon />
            Lookup record
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
    </Popover>
  );
}
