import { useEffect, useState, useCallback } from 'react';
import { forEach, without, flatten } from 'lodash';
import { Collections, Record, CellType } from 'shared/schema';
import { CellData } from 'shared/schema/cell';
import supabase from '~/utils/supabase';
import useGlobalState from '~/hooks/useGlobalState';
import { trpc } from '~/utils/trpc';
import useColumns from './columns';

// the amount of space given between each new order number
const OrderNumberSpacing = 5000;

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
        limit: 100,
      },
    ],
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  useEffect(() => {
    if (recordsQuery.data) {
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
  }, [recordsQuery.data]);

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
          ? records[records.length - 1].order + OrderNumberSpacing
          : records[0].order - OrderNumberSpacing;

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
    async (sourceIndex: number, destinationIndex: number) => {
      if (!user || !sheetId) {
        return Promise.reject('User is not authenticated');
      }

      const destinationRecord = records[destinationIndex];
      const sourceRecord = records[sourceIndex];
      if (!(sourceRecord && destinationRecord)) {
        return Promise.reject('Invalid records');
      }

      sourceRecord.order =
        destinationIndex === 0
          ? destinationRecord.order - OrderNumberSpacing
          : destinationRecord.order; // order number the same because we want to properly reconcile by iterating through all records

      const newRecords = [...records];
      newRecords.splice(sourceIndex, 1);
      newRecords.splice(destinationIndex, 0, sourceRecord);

      // run through all records again, and look for instances where record order number is the same
      let lastOrderNum: number = newRecords[0].order;
      const recordsChanged: Record[] = [sourceRecord];
      for (let i = 1; i < newRecords.length; i++) {
        const record = newRecords[i];

        if (record.order <= lastOrderNum) {
          const nextRecord = newRecords[i + 1];
          if (!nextRecord) {
            record.order = lastOrderNum + OrderNumberSpacing;
          } else if (nextRecord.order > lastOrderNum + 1) {
            record.order = Math.floor(lastOrderNum + (nextRecord.order - lastOrderNum) / 2);
          } else {
            record.order = lastOrderNum + 1;
          }
          recordsChanged.push(record);
        }
        lastOrderNum = record.order;
      }

      setRecords(newRecords);

      // save new order number for all records that changed
      await Promise.all(
        recordsChanged.map(async (record) => {
          return supabase
            .from<Record>(Collections.RECORDS)
            .update({
              order: record.order,
            })
            .eq('id', record.id)
            .then(null, (e) => {
              console.error('Error editing record', e);
            });
        }),
      );
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
