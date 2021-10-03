import { useEffect } from 'react';
import PrivateRoute from '~/components/PrivateRoute';
import { getLayout } from '~/containers/AppLayout';
import useGlobalState from '~/hooks/useGlobalState';
import Home from '~/containers/Home';

export default function IndexPage() {
  const { queryForWorkspaces } = useGlobalState();

  useEffect(() => {
    queryForWorkspaces();
  }, [queryForWorkspaces]);

  return (
    <PrivateRoute>
      <Home />
    </PrivateRoute>
  );
}

IndexPage.getLayout = getLayout;
