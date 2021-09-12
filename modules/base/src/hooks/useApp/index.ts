import { useEffect, useState, useCallback } from 'react';
import { Collections, Sheet } from 'shared/schema';
import supabase from '~/utils/supabase';
import useGlobalState from '~/hooks/useGlobalState';

export default function useApp(appId?: number) {
  const { user } = useGlobalState();
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [isLoadingSheets, setIsLoadingSheets] = useState(true);

  useEffect(() => {
    const loadSheets = async () => {
      const ret = await supabase
        .from<Sheet>(Collections.SHEETS)
        .select('*')
        .eq('appId', appId)
        .eq('isDeleted', false)
        .order('order', { ascending: true });

      if (ret.error || !ret.data) {
        setSheets([]);
        return;
      }

      setSheets(ret.data);
      setIsLoadingSheets(false);
    };

    setIsLoadingSheets(true);
    if (!appId) {
      return;
    }

    loadSheets();
  }, [appId, user]);

  const createSheet = useCallback(
    async (values: { name: string }) => {
      if (!user || !appId) {
        return Promise.reject('User is not authenticated');
      }

      // before adding, replace timestamp with server helper
      const data: Sheet = {
        appId,
        name: values.name,
        order: 5000,
        columns: [],
        isDeleted: false,
        createdAt: new Date(),
      };

      const ret = await supabase.from<Sheet>(Collections.SHEETS).insert(data);
      if (ret.error || !ret.data) {
        console.error('Error creating sheet', ret.error);
        return Promise.reject('Error creating sheet');
      }

      return ret.data[0];
    },
    [user, appId],
  );

  return {
    sheets,
    isLoadingSheets,
    createSheet,
  };
}
