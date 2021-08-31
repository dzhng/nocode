import React, { useCallback } from 'react';
import { useRouter } from 'next/router';
import { Collections, App } from 'shared/schema';
import supabase from '~/utils/supabase';
import { useAppState } from '~/hooks/useAppState';
import withPrivateRoute from '~/components/PrivateRoute/withPrivateRoute';
import CreateContainer from '~/components/CreateAppContainer';

export default withPrivateRoute(function CreateCallPage() {
  const router = useRouter();
  const { user, currentWorkspaceId } = useAppState();

  // prefetch next page for fast loading
  router.prefetch('/app/[slug]');

  const create = useCallback(
    async (values) => {
      if (!user || !currentWorkspaceId) {
        return Promise.reject('User is not authenticated');
      }

      // before adding, replace timestamp with server helper
      const data: App = {
        name: values.name,
        workspaceId: currentWorkspaceId,
        creatorId: user.id,
        isDeleted: false,
        createdAt: new Date(),
      };

      const ret = await supabase.from<App>(Collections.APPS).insert(data);
      if (ret.error || !ret.data) {
        console.error('Error creating app', ret.error);
        return;
      }

      // navigate to new tempalate page to set it up
      router.push(`/app/${ret.data[0].id}`);
    },
    [router, user, currentWorkspaceId],
  );

  return <CreateContainer save={create} />;
});
