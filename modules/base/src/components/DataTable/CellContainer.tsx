import { styled } from '@mui/material';

export default styled('div')(({ theme }) => ({
  display: 'inline-block',
  height: '100%',
  overflow: 'hidden',
  border: `1px solid ${theme.borderColor}`,
}));
