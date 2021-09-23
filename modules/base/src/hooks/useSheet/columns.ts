import { useState, useEffect, useCallback } from 'react';
import { Collections, ColumnType, Sheet } from 'shared/schema';
import supabase from '~/utils/supabase';
import useGlobalState from '~/hooks/useGlobalState';

export default function useColumns(sheetId?: number) {
  const { user } = useGlobalState();
  const [columns, setColumns] = useState<ColumnType[]>([]);
  const [isLoadingColumns, setIsLoadingColumns] = useState(true);

  useEffect(() => {
    const loadColumns = async () => {
      // REWRITE TO USE USEQUERY
      const sheetRet = await supabase
        .from<Sheet>(Collections.SHEETS)
        .select('columns')
        .eq('id', sheetId)
        .single();

      if (sheetRet.error || !sheetRet.data) {
        setColumns([]);
        return;
      }
      setColumns(sheetRet.data.columns);

      setIsLoadingColumns(false);
    };

    setIsLoadingColumns(true);
    if (!sheetId) {
      return;
    }

    loadColumns();
  }, [sheetId, user]);

  // generate a new column ID client side that doesn't conflict with existing columns
  const generateColumnId = useCallback(() => {
    const largestId = Math.max(0, ...columns.map((c) => c.id));
    return largestId + 1;
  }, [columns]);

  const addColumn = useCallback(
    async (column: ColumnType, index: number) => {
      const newColumns = [...columns];
      newColumns.splice(index, 0, column);
      // optimistically update
      setColumns(newColumns);

      const { error } = await supabase
        .from<Sheet>(Collections.SHEETS)
        .update({ columns: newColumns }, { returning: 'minimal' })
        .eq('id', sheetId);

      if (error) {
        // revert to original columns array on error
        setColumns(columns);
      }
    },
    [columns, sheetId],
  );

  const removeColumn = useCallback(
    async (index: number) => {
      const newColumns = [...columns];
      newColumns.splice(index, 1);
      // optimistically update
      setColumns(newColumns);

      const { error } = await supabase
        .from<Sheet>(Collections.SHEETS)
        .update({ columns: newColumns }, { returning: 'minimal' })
        .eq('id', sheetId);

      if (error) {
        // revert to original columns array on error
        setColumns(columns);
      }
    },
    [columns, sheetId],
  );

  const changeColumn = useCallback(() => {
    // TODO
  }, []);

  return {
    columns,
    isLoadingColumns,
    generateColumnId,
    addColumn,
    changeColumn,
    removeColumn,
  };
}
