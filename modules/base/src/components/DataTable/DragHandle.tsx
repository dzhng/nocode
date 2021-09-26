import { Box } from '@mui/material';
import { DragHandle as DragHandleIcon } from '~/components/Icons';
import { SelectorCellSize, DefaultCellHeight } from './const';

export default function DragHandle({ isDragging }: { isDragging: boolean }) {
  return (
    <Box
      sx={{
        color: 'grey.500',
        width: SelectorCellSize,
        height: DefaultCellHeight,
        paddingTop: '10px',
        paddingLeft: `${(SelectorCellSize - 20) / 2}px`,
        cursor: isDragging ? 'grabbing' : 'grab',

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
