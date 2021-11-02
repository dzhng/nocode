import { Popover, Box } from '@mui/material';
import { OptionColorPalette } from '~/const';

export default function OptionColorPicker({
  anchorEl,
  selectedValue,
  onSelect,
  onClose,
}: {
  anchorEl?: Element | null;
  selectedValue?: string;
  onSelect(color: string): void;
  onClose(): void;
}) {
  const shouldOpen = !!anchorEl;

  return (
    <Popover
      open={shouldOpen}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
    >
      <Box
        sx={{
          width: 120,
          padding: 1,
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        {OptionColorPalette.map((color) => (
          <Box
            key={color}
            sx={{
              flexShrink: 0,
              width: 26,
              height: 26,
              borderRadius: 26 / 2,
              my: '3px',
              mr: 1,
              cursor: 'pointer',
              border: (theme) => (color === selectedValue ? '2px solid #333' : theme.dividerBorder),
              backgroundColor: color,

              ':hover': {
                border: '1px solid #777',
              },
            }}
            onClick={() => onSelect(color)}
          />
        ))}
      </Box>
    </Popover>
  );
}
