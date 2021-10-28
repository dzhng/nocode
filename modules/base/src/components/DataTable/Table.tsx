import { styled } from '@mui/material';

export const Table = styled('div')({});

export const TableHead = styled('div')({});

export const TableBody = styled('div')({});

export const TableHeaderRow = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  width: 'fit-content',
  fontWeight: 'bold',
  color: theme.palette.grey[700],
}));

export const TableRow = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  width: 'fit-content',
  marginTop: 3,
  marginBottom: 3,
  borderRadius: 5,
  overflow: 'hidden',
  border: '1px solid #efefef',
  boxShadow: '0px 1px 2px 0px rgb(0 0 0 / 8%)',
  backgroundColor: 'white',

  '&:hover': {
    boxShadow: `0px 1px 3px 0px ${theme.hoverColor}`,
    border: `1px solid ${theme.palette.primary.light}`,

    '& span': {
      borderColor: theme.palette.primary.light,
    },
  },
}));

export const TableCell = styled('div')(() => ({
  flexShrink: 0,
  flexGrow: 0,
  verticalAlign: 'inherit',
  overflow: 'hidden',
}));
