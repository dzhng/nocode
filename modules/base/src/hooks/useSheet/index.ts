import { useEffect, useState, useCallback } from 'react';
import { Collections, Record, CellType } from 'shared/schema';
import supabase from '~/utils/supabase';
import useGlobalState from '~/hooks/useGlobalState';
import useColumns from './columns';

export default function useSheet(sheetId?: number) {
  const { user } = useGlobalState();
  const [records, setRecords] = useState<Record[]>([]);
  //const [currentPage, setCurrentPage] = useState<number>(0);
  const [isLoadingRecords, setIsLoadingRecords] = useState(true);

  useEffect(() => {
    const loadRecords = async () => {
      const ret = await supabase
        .from<Record>(Collections.RECORDS)
        .select('*')
        .eq('sheetId', sheetId)
        .order('order', { ascending: true })
        .limit(5000);

      if (ret.error || !ret.data) {
        setRecords([]);
        return;
      }

      setRecords(ret.data);
      setIsLoadingRecords(false);
    };

    setIsLoadingRecords(true);
    if (!sheetId) {
      return;
    }

    loadRecords();
  }, [sheetId, user]);

  const createRecord = useCallback(
    async (cellData: { [id: string]: CellType }, atEnd: boolean) => {
      if (!user || !sheetId) {
        return Promise.reject('User is not authenticated');
      }

      if (isLoadingRecords) {
        return Promise.reject('Cannot create records while still loading');
      }

      const order =
        records.length === 0
          ? 0
          : atEnd
          ? records[records.length - 1].order + 10
          : records[0].order - 10;

      // before adding, replace timestamp with server helper
      const now = new Date();
      const data: Record = {
        sheetId,
        order,
        data: cellData,
        createdAt: now,
        modifiedAt: now,
      };

      supabase
        .from<Record>(Collections.RECORDS)
        .insert(data)
        .then(null, (e) => {
          console.error('Error creating record', e);
        });

      const newRecords = atEnd ? [...records, data] : [data, ...records];
      setRecords(newRecords);
    },
    [user, sheetId, records, isLoadingRecords],
  );

  const editRecord = useCallback(
    async (id: number, cellData: { [id: string]: CellType }) => {
      if (!user || !sheetId) {
        return Promise.reject('User is not authenticated');
      }

      const localIndex = records.findIndex((rec) => rec.id === id);
      if (localIndex === -1) {
        return Promise.reject('Invalid record');
      }

      const now = new Date();
      supabase
        .from<Record>(Collections.RECORDS)
        .update({
          data: cellData,
          modifiedAt: now,
        })
        .eq('id', id)
        .then(null, (e) => {
          console.error('Error editing record', e);
        });

      const newRecords = [...records];
      newRecords[localIndex].data = cellData;
      newRecords[localIndex].modifiedAt = now;
      setRecords(newRecords);
    },
    [user, sheetId, records],
  );

  const reorderRecord = useCallback(
    async (id: number, nextTo: Record, after: boolean) => {
      if (!user || !sheetId) {
        return Promise.reject('User is not authenticated');
      }

      const localIndex = records.findIndex((rec) => rec.id === id);
      if (localIndex === -1) {
        return Promise.reject('Invalid record');
      }

      const newOrderNumber = after ? nextTo.order + 1 : nextTo.order - 1;

      // save new order number
      supabase
        .from<Record>(Collections.RECORDS)
        .update({
          order: newOrderNumber,
        })
        .eq('id', id)
        .then(null, (e) => {
          console.error('Error editing record', e);
        });

      const newRecords = [...records];
      newRecords[localIndex].order = newOrderNumber;
      newRecords.sort((a, b) => a.order - b.order);
      setRecords(newRecords);
    },
    [user, sheetId, records],
  );

  return {
    records,
    isLoadingRecords,
    createRecord,
    editRecord,
    reorderRecord,
    ...useColumns(sheetId),
  };
}
