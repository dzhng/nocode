import { useEffect, useState, useCallback } from 'react';
import { values } from 'lodash';
import { Collections, Sheet } from 'shared/schema';
import supabase from '~/utils/supabase';
import useGlobalState from '~/hooks/useGlobalState';
import { OrderNumberSpacing } from '~/const';
import { useAppSelector, useAppDispatch } from '~/store';
import sheetStore from '~/store/sheet';

export default function useSheets(appId?: number) {
  const { user } = useGlobalState();
  const dispatch = useAppDispatch();
  const sheets = useAppSelector((state) =>
    values(state.sheet.sheets).filter((s) => s.appId === appId),
  );
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
      dispatch(sheetStore.actions.setSheetsForApp({ appId, sheets: [] }));
      return;
    }

    dispatch(sheetStore.actions.setSheetsForApp({ appId, sheets: ret.data }));
    setIsLoadingSheets(false);
  }, [appId, user, dispatch]);

  useEffect(() => {
    loadSheets();
  }, [loadSheets]);

  const createSheet = useCallback(
    async (values: { name: string }) => {
      if (!user || !appId) {
        return Promise.reject('User is not authenticated');
      }

      const order = sheets.length > 0 ? sheets[sheets.length - 1].order + OrderNumberSpacing : 0;

      // before adding, replace timestamp with server helper
      const data: Sheet = {
        appId,
        name: values.name,
        order,
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
      dispatch(sheetStore.actions.addSheet({ sheet: newSheet }));

      return newSheet;
    },
    [user, appId, sheets, dispatch],
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

      dispatch(sheetStore.actions.removeSheet({ sheetId }));
    },
    [user, appId, dispatch],
  );

  return {
    sheets,
    isLoadingSheets,
    createSheet,
    deleteSheet,
  };
}
