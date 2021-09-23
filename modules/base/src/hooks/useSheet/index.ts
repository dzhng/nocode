import { useEffect, useState, useCallback } from 'react';
import { forEach, without, flatten } from 'lodash';
import { Collections, Record, CellType } from 'shared/schema';
import { CellData } from 'shared/schema/cell';
import supabase from '~/utils/supabase';
import useGlobalState from '~/hooks/useGlobalState';
import { trpc } from '~/utils/trpc';
import useColumns from './columns';

export default function useSheet(sheetId?: number) {
  const { user } = useGlobalState();
  const [records, setRecords] = useState<Record[]>([]);
  // all cells, seperated by recordIds
  const [cells, setCells] = useState<{ [recordId: number]: CellData[] | undefined }>({});

  const recordsQuery = trpc.useInfiniteQuery(
    [
      'record.infiniteQuery',
      {
        sheetId: sheetId ?? -1,
        limit: 10,
      },
    ],
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  useEffect(() => {
    if (recordsQuery.isSuccess && recordsQuery.data) {
      setRecords(flatten(recordsQuery.data.pages.map((p) => p.records)));

      const allCells = flatten(recordsQuery.data.pages.map((p) => p.cells));
      const cellsMap = allCells.reduce((map, value) => {
        if (!value.recordId) return map;
        const cells = map[value.recordId];
        map[value.recordId] = cells ? [...cells, value] : [value];
        return map;
      }, {} as { [id: string]: CellData[] });

      setCells(cellsMap);
    }
  }, [recordsQuery.data, recordsQuery.isSuccess]);

  const createRecordMutation = trpc.useMutation('record.create', {
    onMutate: ({ record, data }) => {
      const recordsClone = [...records, record];
      recordsClone.sort((a, b) => a.order - b.order);
      setRecords(recordsClone);

      if (data) {
        const cellsClone = { ...cells, [record.id ?? 0]: data };
        setCells(cellsClone);
      }
    },
    onError: (error, { record, data }) => {
      console.error('Error creating record', error);
      // undo the optimistic insert
      const recordsClone = [...records];
      const insertedIndex = recordsClone.findIndex((r) => r.id === record.id);
      if (insertedIndex !== -1) {
        recordsClone.splice(insertedIndex, 1);
        setRecords(recordsClone);
      }

      if (data) {
        const cellsClone = { ...cells };
        delete cellsClone[record.id ?? 0];
        setCells(cellsClone);
      }
    },
  });

  const editRecordMutation = trpc.useMutation('record.edit', {
    onMutate: ({ recordId, columnId, data }) => {
      const recordCells = cells[recordId];
      const currentCells = recordCells ? [...recordCells] : [];
      const cell = currentCells.find((c) => c.columnId === columnId);
      if (cell) {
        const cellsClone = {
          ...cells,
          [recordId]: [...without(currentCells, cell), { ...cell, data, modifiedAt: new Date() }],
        };
        setCells(cellsClone);
        return cells;
      }
    },
    onError: (error, _, context) => {
      console.error('Error editing record', error);
      setCells(context as { [id: string]: CellData[] });
    },
  });

  const createRecord = useCallback(
    async (data: { [id: number]: CellType }, atEnd: boolean) => {
      if (!user || !sheetId) {
        return Promise.reject('User is not authenticated');
      }

      if (!recordsQuery.isFetched) {
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
      const record: Record = {
        sheetId,
        order,
        createdAt: now,
      };

      // create the data object
      const cellData: CellData[] = [];
      forEach(data, (value, key) => {
        const ret: CellData = {
          columnId: Number(key),
          data: value,
          createdAt: now,
          modifiedAt: now,
        };
        cellData.push(ret);
      });

      createRecordMutation.mutate({ record, data: cellData });
    },
    [user, sheetId, records, createRecordMutation, recordsQuery],
  );

  const editRecord = useCallback(
    async (id: number, columnId: number, data: CellType) => {
      if (!user || !sheetId) {
        return Promise.reject('User is not authenticated');
      }

      const localIndex = records.findIndex((rec) => rec.id === id);
      if (localIndex === -1) {
        return Promise.reject('Invalid record');
      }

      editRecordMutation.mutate({ recordId: id, columnId, data });
    },
    [user, sheetId, records, editRecordMutation],
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

  const cellForRecord = useCallback(
    (recordId: number, columnId: number) => {
      const recordCells = cells[recordId];
      if (!recordCells) {
        return undefined;
      }

      return recordCells.find((c) => c.columnId === columnId);
    },
    [cells],
  );

  return {
    records,
    isLoadingRecords: recordsQuery.isFetching,
    createRecord,
    editRecord,
    reorderRecord,
    cellForRecord,
    ...useColumns(sheetId),
  };
}
