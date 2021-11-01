import { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Popover,
  TextField,
  Divider,
  Button,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import { DataTypes } from 'shared/schema';
import {
  BackIcon,
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
import TypeComponents from './TypeConfiguration';

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

  const handleTypeConfigurationChange = useCallback((data: object) => {
    // TODO
  }, []);

  const TypeConfiguration = TypeComponents[selectedType];

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
          width: 220,
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

        {TypeConfiguration ? (
          <>
            <Button
              size="small"
              sx={{
                height: 20,
                mb: 1,
                fontSize: '11px',
                lineHeight: '20px',
                ml: -1,
                pl: '0 !important',

                '> svg': {
                  width: 12,
                  height: 12,
                  mr: 0.5,
                },
              }}
              onClick={(e) => handleTypeChange(e, DataTypes.Text)}
            >
              <BackIcon /> Back
            </Button>
            <TypeConfiguration onChange={handleTypeConfigurationChange} />
          </>
        ) : (
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
        )}

        <Divider sx={{ mt: 1, mb: 1 }} />

        <Button fullWidth size="small" variant="contained" onClick={handleAddField}>
          Add Field
        </Button>
      </Box>
    </Popover>
  );
}
