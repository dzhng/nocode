import { useRouter } from 'next/router';
import AppContainer from '~/containers/App';
import withPrivateRoute from '~/components/PrivateRoute/withPrivateRoute';

export default withPrivateRoute(function AppPage() {
  const router = useRouter();
  const appId = Number(router.query.slug);

  if (!appId) {
    return null;
  }

  return <AppContainer appId={appId} />;
});
