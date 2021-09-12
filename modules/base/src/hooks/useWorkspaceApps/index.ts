import { useEffect, useState, useCallback } from 'react';
import { Collections, App } from 'shared/schema';
import supabase from '~/utils/supabase';
import useGlobalState from '~/hooks/useGlobalState';

export default function useWorkspaceMembers(workspaceId?: number) {
  const { user } = useGlobalState();
  const [apps, setApps] = useState<App[]>([]);
  const [isLoadingApps, setIsLoadingApps] = useState(true);

  useEffect(() => {
    const loadApps = async () => {
      const ret = await supabase
        .from<App>(Collections.APPS)
        .select('*')
        .eq('workspaceId', workspaceId)
        .eq('isDeleted', false);

      if (ret.error || !ret.data) {
        setApps([]);
        return;
      }

      setApps(ret.data);
      setIsLoadingApps(false);
    };

    setIsLoadingApps(true);
    if (!workspaceId) {
      return;
    }

    loadApps();
  }, [workspaceId, user]);

  const createApp = useCallback(
    async (values: { name: string }) => {
      if (!user || !workspaceId) {
        return Promise.reject('User is not authenticated');
      }

      // before adding, replace timestamp with server helper
      const data: App = {
        name: values.name,
        workspaceId: workspaceId,
        creatorId: user.id,
        isDeleted: false,
        createdAt: new Date(),
      };

      const ret = await supabase.from<App>(Collections.APPS).insert(data);
      if (ret.error || !ret.data) {
        console.error('Error creating app', ret.error);
        return Promise.reject('Error creating app');
      }

      return ret.data[0];
    },
    [user, workspaceId],
  );

  return {
    apps,
    isLoadingApps,
    createApp,
  };
}
