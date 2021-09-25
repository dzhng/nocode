import { styled } from '@mui/material';

export const Table = styled('table')({
  borderCollapse: 'collapse',
  borderSpacing: 0,
  overflow: 'hidden',
});

export const TableHead = styled('thead')({});

export const TableBody = styled('tbody')({});

export const TableRow = styled('tr')(({ theme }) => ({
  verticalAlign: 'middle',
  outline: 0,
  overflow: 'hidden',
}));

export const TableCell = styled('th')(({ theme }) => ({
  verticalAlign: 'inherit',
  overflow: 'hidden',
}));
