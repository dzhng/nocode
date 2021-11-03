import { useRef, useState, useCallback } from 'react';
import { Box, IconButton, Popover, Button } from '@mui/material';
import { FieldType, SelectionMeta } from 'shared/schema';
import { SelectionDropdownIcon } from '~/components/Icons';
import { CellHeightSmall } from '../const';
import { DefaultOptionColor } from '~/const';

interface PropTypes {
  height: number;
  field: FieldType;
  optionId: string;
  onChange(optionId: string | null): void;
}

const OptionSx = {
  height: CellHeightSmall - 14,
  lineHeight: `${CellHeightSmall - 14}px`,
  borderRadius: (CellHeightSmall - 14) / 2,
  border: 1,
  m: 1,
  px: 1,
  fontSize: 15,
  fontWeight: 600,
  color: 'white',
  textAlign: 'center',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

export default function Selection({ height, field, optionId, onChange }: PropTypes) {
  const dropdownRef = useRef<HTMLButtonElement>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const meta = field.typeMetadata as SelectionMeta;
  const option = meta.options.find((o) => o.id === optionId);

  const handlePopoverClose = useCallback(() => {
    setPopoverOpen(false);
  }, []);

  const handlePopoverOpen = useCallback(() => {
    setPopoverOpen(true);
  }, []);

  const handleOptionSelected = useCallback(
    (optionId: string | null) => {
      setPopoverOpen(false);
      onChange(optionId);
    },
    [onChange],
  );

  return (
    <Box
      sx={{
        height,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <Box
        sx={{ height, flexGrow: 1, overflow: 'hidden', cursor: 'pointer' }}
        onClick={handlePopoverOpen}
      >
        {option && option.value && (
          <Box
            sx={{
              // @ts-ignore issue with destructuring sx
              backgroundColor: option.color ?? DefaultOptionColor,
              ...OptionSx,
            }}
          >
            {option.value}
          </Box>
        )}
      </Box>

      <IconButton
        size="small"
        sx={{ width: height / 2, height: height / 2, mx: 0.5, flexShrink: 0 }}
        ref={dropdownRef}
        onClick={handlePopoverOpen}
      >
        <SelectionDropdownIcon />
      </IconButton>

      <Popover
        open={popoverOpen}
        anchorEl={dropdownRef.current}
        onClick={handlePopoverClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        {meta.options.map((option) => (
          // @ts-ignore issue with destructuring sx
          <Box
            key={option.id}
            onClick={() => handleOptionSelected(option.id)}
            sx={{
              minWidth: 60,
              backgroundColor: option.color ?? DefaultOptionColor,
              cursor: 'pointer',
              ...OptionSx,
            }}
          >
            {option.value}
          </Box>
        ))}

        {option && (
          <Button fullWidth size="small" onClick={() => handleOptionSelected(null)}>
            Clear
          </Button>
        )}
      </Popover>
    </Box>
  );
}
