import { useEffect, useCallback } from 'react';
import { forEach, without } from 'lodash';
import { Collections, Record, CellType } from 'shared/schema';
import supabase from '~/utils/supabase';
import useGlobalState from '~/hooks/useGlobalState';
import { trpc } from '~/utils/trpc';
import recordStore from '~/store/record';
import sheetStore from '~/store/sheet';
import { useAppSelector } from '~/store';
import useColumns from './columns';

// the amount of space given between each new order number
const OrderNumberSpacing = 5000;

export default function useSheet(sheetId?: number) {
  const { user } = useGlobalState();
  const records = useAppSelector((state) =>
    state.record.recordsBySheet[Number(sheetId)].map((id) => state.record.records[id]),
  );

  const recordsQuery = trpc.useQuery([
    'record.downloadRecords',
    {
      sheetId: sheetId ?? -1,
      // set super high limit to basically just query all records
      limit: 500000,
    },
  ]);

  useEffect(() => {
    if (recordsQuery.data && sheetId) {
      recordStore.actions.setRecordsForSheet({ sheetId, records: recordsQuery.data.records });
      sheetStore.actions.setLatestChangeForSheet({
        sheetId,
        change: recordsQuery.data.latestChange,
      });
    }
  }, [recordsQuery.data, sheetId]);

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
    async (data: { [id: number]: CellType }, index: number) => {
      if (!user || !sheetId) {
        return Promise.reject('User is not authenticated: createRecord');
      }

      if (!recordsQuery.isFetched) {
        return Promise.reject('Cannot create records while still loading');
      }

      const order =
        records.length === 0
          ? 0
          : index === records.length
          ? records[records.length - 1].order + OrderNumberSpacing
          : records[index].order - OrderNumberSpacing;

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
        return Promise.reject('User is not authenticated: editRecord');
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
        return Promise.reject('User is not authenticated: reorderRecord');
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

  const cellDataForRecord = useCallback((record: Record, columnId: number): CellType => {
    const recordCells = record.cells;
    if (!recordCells) {
      return null;
    }

    const data = recordCells.find(([id]) => id === columnId);
    return data ? data[1] : null;
  }, []);

  return {
    records,
    isLoadingRecords: !recordsQuery.isFetched,
    createRecord,
    editRecord,
    reorderRecord,
    cellDataForRecord,
    ...useColumns(sheetId),
  };
}
