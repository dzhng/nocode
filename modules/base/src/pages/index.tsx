import { useEffect, ReactElement } from 'react';
import PrivateRoute from '~/components/PrivateRoute';
import AppLayout from '~/containers/AppLayout';
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

IndexPage.getLayout = function getLayout(page: ReactElement) {
  return <AppLayout>{page}</AppLayout>;
};
