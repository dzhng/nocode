import { useEffect, useState, useCallback } from 'react';
import { Collections, Sheet } from 'shared/schema';
import supabase from '~/utils/supabase';
import useGlobalState from '~/hooks/useGlobalState';

export default function useApp(appId?: number) {
  const { user } = useGlobalState();
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [isLoadingSheets, setIsLoadingSheets] = useState(true);

  // NOTE: excluding columns field for sheets (too big)
  // columns should be queried via useSheet
  useEffect(() => {
    const loadSheets = async () => {
      const ret = await supabase
        .from<Sheet>(Collections.SHEETS)
        .select('id, name, appId, order, createdAt')
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

      // add new sheet to end of sheets list
      const newSheet = ret.data[0];
      setSheets([...sheets, newSheet]);

      return newSheet;
    },
    [user, appId, sheets],
  );

  const deleteSheet = useCallback(
    async (sheetId: number) => {
      if (!user || !appId) {
        return Promise.reject('User is not authenticated');
      }

      const { error } = await supabase
        .from<Sheet>(Collections.SHEETS)
        .update({ isDeleted: true }, { returning: 'minimal' })
        .eq('id', sheetId);
      if (error) {
        console.error('Error deleting sheet', error);
        return Promise.reject('Error deleting sheet');
      }

      // remove deleted sheet
      const sheetsClone = [...sheets];
      const idx = sheetsClone.findIndex((s) => s.id === sheetId);
      sheetsClone.splice(idx, 1);
      setSheets(sheetsClone);
    },
    [user, appId, sheets],
  );

  return {
    sheets,
    isLoadingSheets,
    createSheet,
    deleteSheet,
  };
}
