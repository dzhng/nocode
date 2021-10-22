import { useState, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { Collections, App } from 'shared/schema';
import supabase from '~/utils/supabase';
import { OrderNumberSpacing } from '~/const';

export default function useWorkspaceApps(authState: { user?: User | null }, workspaceId?: number) {
  const { user } = authState;
  const [apps, setApps] = useState<App[]>([]);
  const [isLoadingApps, setIsLoadingApps] = useState(true);

  const queryForApps = useCallback(async () => {
    if (!workspaceId || !user) {
      setApps([]);
      return;
    }

    setIsLoadingApps(true);

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
  }, [workspaceId, user]);

  const createApp = useCallback(
    async (values: { name: string }) => {
      if (!user || !workspaceId) {
        return Promise.reject('User is not authenticated: createApp');
      }

      const order = apps.length > 0 ? apps[apps.length - 1].order + OrderNumberSpacing : 0;

      // before adding, replace timestamp with server helper
      const data: App = {
        name: values.name,
        order,
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
    [user, workspaceId, apps],
  );

  return {
    queryForApps,
    apps,
    isLoadingApps,
    createApp,
  };
}
