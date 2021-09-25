import { IconButton } from '@mui/material';
import { CheckedIcon, UncheckedIcon } from '~/components/Icons';

export default function Checkbox({
  isChecked,
  toggleChecked,
}: {
  isChecked: boolean;
  toggleChecked?(): void;
}) {
  // The icon display is a bit weird here, since it uses CSS instead of JS to control the visibility of the checked or unchecked icons. This is because the mouseLeave event does not always fire if cursor moves fast, which makes CSS the most reliable way of showing / hiding these elements
  return (
    <IconButton
      size="small"
      onClick={toggleChecked}
      sx={{
        marginTop: '5px',
        marginLeft: '4px',
        color: 'grey.500',

        '& #checked': {
          display: isChecked ? 'inline-block' : 'none',
        },
        '& #unchecked': {
          display: isChecked ? 'none' : 'inline-block',
        },

        '&:hover': {
          color: 'primary.main',
          '& #checked': {
            display: 'inline-block',
          },
          '& #unchecked': {
            display: 'none',
          },
        },

        '&>svg': { width: 20, height: 20 },
      }}
    >
      <CheckedIcon id="checked" />
      <UncheckedIcon id="unchecked" />
    </IconButton>
  );
}
