import { useEffect, useCallback } from 'react';
import { forEach } from 'lodash';
import { v1 as uuid } from 'uuid';
import { Operation, Record, CellType } from 'shared/schema';
import useGlobalState from '~/hooks/useGlobalState';
import { trpc } from '~/utils/trpc';
import recordStore from '~/store/record';
import sheetStore from '~/store/sheet';
import { useAppSelector, useAppDispatch } from '~/store';
import { OrderNumberSpacing } from '~/const';
import useOperationQueue from '~/hooks/useOperationQueue';
import useFields from './fields';

export default function useSheet(sheetId?: number) {
  const { user } = useGlobalState();
  const dispatch = useAppDispatch();
  const { queueOperation } = useOperationQueue();
  const recordsMap = useAppSelector((state) => state.record.records);
  const records = useAppSelector((state) =>
    state.record.recordsBySheet[Number(sheetId)]
      ? state.record.recordsBySheet[Number(sheetId)].map((id) => recordsMap[id])
      : [],
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
      dispatch(
        recordStore.actions.setRecordsForSheet({ sheetId, records: recordsQuery.data.records }),
      );

      recordsQuery.data.latestOp &&
        dispatch(
          sheetStore.actions.setLatestOpForSheet({
            sheetId,
            operation: recordsQuery.data.latestOp,
          }),
        );
    }
  }, [recordsQuery.data, sheetId, dispatch]);

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

      // create the data object
      const cellData: [fieldId: string, data: CellType][] = [];
      forEach(data, (value, key) => {
        cellData.push([key, value]);
      });

      const record: Record = {
        slug: uuid(),
        sheetId,
        order,
        cells: cellData,
        createdAt: new Date(),
      };

      const operation: Partial<Operation> = {
        type: 'create_record',
        sheetId,
        slug: record.slug,
        value: record,
      };

      dispatch(recordStore.actions.createRecord({ record, index }));
      queueOperation(operation);
    },
    [user, sheetId, records, recordsQuery, dispatch, queueOperation],
  );

  const editRecord = useCallback(
    async (slug: string, fieldId: string, data: CellType) => {
      if (!user || !sheetId) {
        return Promise.reject('User is not authenticated: editRecord');
      }

      const operation: Partial<Operation> = {
        type: 'update_cell',
        sheetId,
        slug,
        value: [fieldId, data],
      };

      dispatch(recordStore.actions.updateRecordData({ slug, fieldId, data }));
      queueOperation(operation);
    },
    [user, sheetId, dispatch, queueOperation],
  );

  const reorderRecord = useCallback(
    async (sourceIndex: number, destinationIndex: number) => {
      if (!user || !sheetId) {
        return Promise.reject('User is not authenticated: reorderRecord');
      }

      dispatch(recordStore.actions.reorderRecord({ sheetId, sourceIndex, destinationIndex }));

      // calculate new order numbers for saving to server
      const destinationRecord = records[destinationIndex];
      const sourceRecord = records[sourceIndex];
      if (!destinationRecord || !sourceIndex) {
        return Promise.reject('Invalid records');
      }

      const newOrder =
        destinationIndex === 0
          ? destinationRecord.order - OrderNumberSpacing
          : destinationRecord.order; // order number the same because we want to properly reconcile by iterating through all records

      const orderNumbers: [string, number][] = records.map((record) => [
        record.slug,
        record.slug === sourceRecord.slug ? newOrder : record.order,
      ]);
      const [sourceTuple] = orderNumbers.splice(sourceIndex, 1);
      orderNumbers.splice(destinationIndex, 0, sourceTuple);

      // run through all records again, and look for instances where record order number is the same
      let lastOrderNum: number = orderNumbers[0][1];
      const recordsChanged: [string, number][] =
        destinationIndex === 0 ? [[sourceRecord.slug, newOrder]] : [];

      for (let i = 1; i < orderNumbers.length; i++) {
        let [slug, order] = orderNumbers[i];

        if (order <= lastOrderNum) {
          const next = orderNumbers[i + 1];
          if (!next) {
            order = lastOrderNum + OrderNumberSpacing;
          } else if (next[1] > lastOrderNum + 1) {
            order = Math.floor(lastOrderNum + (next[1] - lastOrderNum) / 2);
          } else {
            order = lastOrderNum + 1;
          }
          recordsChanged.push([slug, order]);
        }
        lastOrderNum = order;
      }

      // save new order number for all records that changed
      recordsChanged.map(async ([slug, order]) => {
        const operation: Partial<Operation> = {
          type: 'update_record',
          sheetId,
          slug: slug,
          value: { order: order },
        };

        queueOperation(operation);
      });
    },
    [user, sheetId, records, dispatch, queueOperation],
  );

  const cellDataForRecord = useCallback((record: Record, fieldId: string): CellType => {
    const recordCells = record.cells;
    if (!recordCells) {
      return null;
    }

    const data = recordCells.find(([id]) => id === fieldId);
    return data ? data[1] : null;
  }, []);

  return {
    records,
    isLoadingRecords: !recordsQuery.isFetched,
    createRecord,
    editRecord,
    reorderRecord,
    cellDataForRecord,
    ...useFields(sheetId),
  };
}
