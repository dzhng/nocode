import PrivateRoute from '~/components/PrivateRoute';
import { getLayout } from '~/containers/AppLayout';
import Home from '~/containers/Home';

export default function IndexPage() {
  return (
    <PrivateRoute>
      <Home />
    </PrivateRoute>
  );
}

IndexPage.getLayout = getLayout;
