import { useState, useEffect, useCallback } from 'react';
import produce from 'immer';
import { debounce } from 'lodash';
import { Collections, ColumnType, Sheet, TableMeta } from 'shared/schema';
import supabase from '~/utils/supabase';
import useGlobalState from '~/hooks/useGlobalState';

const debouncedColumnWidthUpdate = debounce((sheetId: number, columns: ColumnType[]) => {
  return supabase
    .from<Sheet>(Collections.SHEETS)
    .update({ columns }, { returning: 'minimal' })
    .eq('id', sheetId);
}, 500);

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

  const changeColumnName = useCallback(
    async (columnId: number, name: string) => {
      const columnIndex = columns.findIndex((c) => c.id === columnId);
      if (!sheetId || columnIndex === -1) {
        throw new Error('Column not found');
      }

      const newColumns = produce(columns, (draft) => {
        const column = draft[columnIndex];
        column.name = name;
        draft[columnIndex] = column;
      });

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

  const changeColumnWidth = useCallback(
    async (columnId: number, width: number) => {
      const columnIndex = columns.findIndex((c) => c.id === columnId);
      if (!sheetId || columnIndex === -1) {
        throw new Error('Column not found');
      }

      const newColumns = produce(columns, (draft) => {
        const column = draft[columnIndex];

        const metadata: TableMeta = column.tableMetadata ?? {};
        metadata.width = width;
        column.tableMetadata = metadata;

        draft[columnIndex] = column;
      });

      setColumns(newColumns);
      debouncedColumnWidthUpdate(sheetId, newColumns);
    },
    [columns, sheetId],
  );

  return {
    columns,
    isLoadingColumns,
    generateColumnId,
    addColumn,
    changeColumnName,
    changeColumnWidth,
    removeColumn,
  };
}
