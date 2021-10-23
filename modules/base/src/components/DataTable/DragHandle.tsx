import { Box } from '@mui/material';
import { DragHandle as DragHandleIcon } from '~/components/Icons';
import { DefaultCellHeight } from './const';

export default function DragHandle({ ...props }: { [props: string]: any }) {
  return (
    <Box
      {...props}
      sx={{
        color: 'grey.500',
        height: DefaultCellHeight,
        paddingTop: '10px',

        '&:hover': {
          color: 'primary.main',
        },

        '&>svg': {
          width: 20,
          height: 20,
        },
      }}
    >
      <DragHandleIcon />
    </Box>
  );
}
