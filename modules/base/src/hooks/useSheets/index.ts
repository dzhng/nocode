import { useEffect, useState, useCallback } from 'react';
import { Collections, Sheet } from 'shared/schema';
import supabase from '~/utils/supabase';
import useGlobalState from '~/hooks/useGlobalState';
import sheetStore from '~/store/sheet';

export default function useSheets(appId?: number) {
  const { user } = useGlobalState();
  const [isLoadingSheets, setIsLoadingSheets] = useState(true);

  const loadSheets = useCallback(async () => {
    if (!user || !appId) {
      return;
    }

    setIsLoadingSheets(true);

    const ret = await supabase
      .from<Sheet>(Collections.SHEETS)
      .select('*')
      .eq('appId', appId)
      .eq('isDeleted', false)
      .order('order', { ascending: true });

    if (ret.error || !ret.data) {
      sheetStore.actions.setSheetsForApp({ appId, sheets: [] });
      return;
    }

    sheetStore.actions.setSheetsForApp({ appId, sheets: ret.data });
    setIsLoadingSheets(false);
  }, [appId, user]);

  useEffect(() => {
    loadSheets();
  }, [loadSheets]);

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
        fields: [],
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
      sheetStore.actions.addSheet({ sheet: newSheet });

      return newSheet;
    },
    [user, appId],
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

      sheetStore.actions.removeSheet({ sheetId });
    },
    [user, appId],
  );

  return {
    isLoadingSheets,
    createSheet,
    deleteSheet,
  };
}
