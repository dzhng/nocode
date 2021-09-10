import { Container, CircularProgress } from '@material-ui/core';

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
