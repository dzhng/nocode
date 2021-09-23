import { useEffect } from 'react';
import withPrivateRoute from '~/components/PrivateRoute/withPrivateRoute';
import useGlobalState from '~/hooks/useGlobalState';
import Home from '~/containers/Home';

export default withPrivateRoute(function IndexPage() {
  const { queryForWorkspaces } = useGlobalState();

  useEffect(() => {
    queryForWorkspaces();
  }, [queryForWorkspaces]);

  return <Home />;
});
