import { useCallback } from 'react';
import { Collections } from 'shared/schema';
import supabase from '~/utils/supabase';
import useGlobalState from '~/hooks/useGlobalState';

export default function useColumns(sheetId?: number) {
  const { user } = useGlobalState();

  const addColumn = useCallback(() => {}, []);

  const changeColumn = useCallback(() => {}, []);

  const removeColumn = useCallback(() => {}, []);

  return {
    addColumn,
    changeColumn,
    removeColumn,
  };
}
