import * as trpc from '@trpc/server';
import { z } from 'zod';
import { compact } from 'lodash';
import { Collections, Sheet, Record, RecordSchema, Cell } from 'shared/schema';
import { CellDataSchema, CellData } from 'shared/schema/cell';
import supabase from '~/utils/supabase';
import { dataFieldForCell, cellTypeForDataField } from '~/utils/record';

export default trpc
  .router()
  .query('infiniteQuery', {
    input: z.object({
      sheetId: z.number(),
      // maps to useInfiniteQuery on client side
      limit: z.number().min(1).max(100).nullish(),
      cursor: z.number().nullish(),
    }),
    async resolve({ input }) {
      const { sheetId, limit: _limit, cursor: _cursor } = input;
      const limit = _limit ?? 100;
      const cursor = _cursor ?? 0;

      const { data: sheetData } = await supabase
        .from<Sheet>(Collections.SHEETS)
        .select('*')
        .eq('id', sheetId)
        .single();
      if (!sheetData) {
        throw new trpc.TRPCError({
          code: 'NOT_FOUND',
        });
      }

      const recordRet = await supabase
        .from<Record>(Collections.RECORDS)
        .select('*')
        .eq('sheetId', sheetId)
        .order('order', { ascending: true })
        .range(cursor, cursor + limit - 1);
      if (recordRet.error || !recordRet.data) {
        throw new trpc.TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
        });
      }

      const recordIds = compact(recordRet.data.map((r) => r.id));
      const cellRet = await supabase
        .from<Cell>(Collections.CELLS)
        .select('*')
        .in('recordId', recordIds);
      if (cellRet.error || !cellRet.data) {
        throw new trpc.TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
        });
      }

      // transform cells into digestable CellData
      const cellData = compact(
        cellRet.data.map((cell) => {
          const column = sheetData.columns.find((c) => c.id === cell.columnId);
          if (!column || !cell.id) {
            return null;
          }

          const cellType = cellTypeForDataField(column, cell);
          if (!cellType) {
            return null;
          }

          const data: CellData = {
            id: cell.id,
            data: cellType,
            createdAt: cell.createdAt,
            modifiedAt: cell.modifiedAt,
          };

          return data;
        }),
      );

      return {
        records: recordRet.data,
        cells: cellData,
        nextCursor: cursor + limit,
      };
    },
  })
  .mutation('create', {
    input: z.object({
      record: RecordSchema,
      data: CellDataSchema.array().optional(),
    }),
    async resolve({ input }) {
      const { record, data } = input;

      const { data: sheetData } = await supabase
        .from<Sheet>(Collections.SHEETS)
        .select('*')
        .eq('id', record.sheetId)
        .single();
      if (!sheetData) {
        throw new trpc.TRPCError({
          code: 'NOT_FOUND',
        });
      }

      const { data: recordData, error } = await supabase
        .from<Record>(Collections.RECORDS)
        .insert(record);
      if (error || !recordData) {
        throw new trpc.TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
        });
      }

      // insert the data into individual cell records
      if (data) {
        // build an array of cell objects from the data
        const cells: Cell[] = [];
        data.forEach((value) => {
          const column = sheetData.columns.find((c) => c.id === value.id);
          if (!column) return;

          const dataField = dataFieldForCell(column, value.data);

          cells.push({
            recordId: recordData[0].id ?? 0,
            columnId: value.id,
            createdAt: value.createdAt,
            modifiedAt: value.modifiedAt,
            ...dataField,
          });
        });

        await supabase.from<Cell>(Collections.CELLS).insert(cells, { returning: 'minimal' });
      }
    },
  });
