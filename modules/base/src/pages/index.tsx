import { useEffect } from 'react';
import withPrivateRoute from '~/components/PrivateRoute/withPrivateRoute';
import { useAppState } from '~/hooks/useAppState';
import Home from '~/containers/Home';

export default withPrivateRoute(function IndexPage() {
  const { queryForWorkspaces } = useAppState();

  useEffect(() => {
    queryForWorkspaces();
  }, [queryForWorkspaces]);

  return <Home />;
});
