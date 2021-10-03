import { ReactElement } from 'react';
import { useRouter } from 'next/router';
import PrivateRoute from '~/components/PrivateRoute';
import AppLayout from '~/containers/AppLayout';
import AppContainer from '~/containers/App';

export default function AppPage() {
  const router = useRouter();
  const appId = Number(router.query.slug);

  if (!appId) {
    return null;
  }

  return (
    <PrivateRoute>
      <AppContainer appId={appId} />
    </PrivateRoute>
  );
}

AppPage.getLayout = function getLayout(page: ReactElement) {
  return <AppLayout>{page}</AppLayout>;
};
