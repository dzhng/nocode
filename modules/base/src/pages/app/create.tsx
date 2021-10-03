import React, { useCallback } from 'react';
import { useRouter } from 'next/router';
import useGlobalState from '~/hooks/useGlobalState';
import CreateContainer from '~/containers/CreateApp';
import withPrivateRoute from '~/components/PrivateRoute/withPrivateRoute';

export default withPrivateRoute(function CreateCallPage() {
  const router = useRouter();
  const { createApp } = useGlobalState();

  // prefetch next page for fast loading
  router.prefetch('/app/[slug]');

  const create = useCallback(
    async (values: { name: string }) => {
      const app = await createApp(values);

      // navigate to new tempalate page to set it up
      if (app) {
        router.push(`/app/${app.id}`);
      }
    },
    [router, createApp],
  );

  return <CreateContainer save={create} />;
});
