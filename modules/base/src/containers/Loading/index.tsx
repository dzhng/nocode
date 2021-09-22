import { Container, CircularProgress } from '@mui/material';

export default function LoadingContainer() {
  return (
    <Container style={{ height: '100vh', textAlign: 'center' }}>
      <CircularProgress
        color="primary"
        variant="indeterminate"
        style={{ textAlign: 'center', marginLeft: 'auto', marginRight: 'auto', marginTop: '40vh' }}
      ></CircularProgress>
    </Container>
  );
}
