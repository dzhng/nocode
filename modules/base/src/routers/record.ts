import * as trpc from '@trpc/server';
import { omit } from 'lodash';
import { z } from 'zod';
import {
  Collections,
  Sheet,
  Record,
  RecordSchema,
  Cell,
  CellTypeSchema,
  RecordChange,
} from 'shared/schema';
import supabase from '~/utils/supabase';
import { dataFieldForCell } from '~/utils/record';
import type { Context } from '~/pages/api/trpc/[trpc]';

export default trpc
  .router<Context>()
  .query('downloadRecords', {
    input: z.object({
      sheetId: z.number(),
      // put a ridiculously high limit since the point is to download all records, we accept that this call will be slow, db should be tuned for this
      limit: z.number().min(1).max(1000000).nullish(),
    }),
    async resolve({ input }) {
      const { sheetId, limit: _limit } = input;
      const limit = _limit ?? 500000;

      const recordRet = await supabase
        .from<Record>(Collections.RECORDS)
        .select('*')
        .eq('sheetId', sheetId)
        .order('order', { ascending: true })
        .limit(limit);
      if (recordRet.error || !recordRet.data) {
        throw new trpc.TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
        });
      }

      // get latest changeId and return
      const changeRet = await supabase
        .from<RecordChange>(Collections.RECORD_CHANGE)
        .select('*')
        .eq('sheetId', sheetId)
        .order('id', { ascending: false })
        .limit(1)
        .single();
      if (changeRet.error || !changeRet.data) {
        throw new trpc.TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
        });
      }

      return {
        records: recordRet.data,
        latestChange: changeRet.data,
      };
    },
  })
  .mutation('create', {
    input: z.object({
      record: RecordSchema,
      index: z.number(),
    }),
    async resolve({ input, ctx }) {
      const { record } = input;

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

      const { data: recordData } = await supabase.from<Record>(Collections.RECORDS).insert(record);
      if (!recordData) {
        throw new trpc.TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
        });
      }

      // record the change of the new record
      const now = new Date();
      const changes: RecordChange[] = [
        {
          type: 'create',
          userId: ctx?.user.id ?? '',
          sheetId: recordData[0].sheetId,
          recordId: Number(recordData[0].id),
          modifiedAt: now,
        },
      ];

      // insert the data into individual cell records
      if (record.cells) {
        // build an array of cell objects from the data
        const cells: Cell[] = [];

        record.cells.forEach(([fieldId, data]) => {
          const field = sheetData.fields.find((c) => c.id === fieldId);
          if (!field) return;

          const dataField = dataFieldForCell(field, data);

          cells.push({
            recordId: recordData[0].id ?? 0,
            fieldId: fieldId,
            ...dataField,
          });

          changes.push({
            type: 'update',
            userId: ctx?.user.id ?? '',
            sheetId: recordData[0].sheetId,
            recordId: Number(recordData[0].id),
            fieldId: fieldId,
            value: data,
            modifiedAt: now,
          });
        });

        await supabase.from<Cell>(Collections.CELLS).insert(cells, { returning: 'minimal' });
      }

      await supabase
        .from<RecordChange>(Collections.RECORD_CHANGE)
        .insert(changes, { returning: 'minimal' });
    },
  })
  .mutation('edit', {
    input: z.object({
      recordId: z.number(),
      fieldId: z.number(),
      data: CellTypeSchema,
    }),
    async resolve({ input, ctx }) {
      // fetch the sheet to get field info
      const { data: recordData } = await supabase
        .from<Record & { sheet: Sheet }>(Collections.RECORDS)
        .select(
          ` *,
            sheet:sheetId (*) 
          `,
        )
        .eq('id', input.recordId)
        .single();
      if (!recordData) {
        throw new trpc.TRPCError({
          code: 'NOT_FOUND',
        });
      }

      const field = recordData.sheet.fields.find((c) => c.id === input.fieldId);
      if (!field) {
        throw new trpc.TRPCError({
          code: 'NOT_FOUND',
        });
      }

      // modify record
      const newRecord: Record = omit(recordData, 'sheet');
      newRecord.cells = [
        ...(newRecord.cells?.filter(([fieldId]) => fieldId !== input.fieldId) ?? []),
        [input.fieldId, input.data],
      ];

      const { error: recordError } = await supabase
        .from<Record>(Collections.RECORDS)
        .update(newRecord, { returning: 'minimal' })
        .eq('id', input.recordId);

      if (recordError) {
        throw new trpc.TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: recordError.message,
        });
      }

      // upsert cell
      const now = new Date();
      const dataField = dataFieldForCell(field, input.data);
      const { error: cellError } = await supabase
        .from<Cell>(Collections.CELLS)
        .upsert(
          {
            recordId: input.recordId,
            fieldId: input.fieldId,
            ...dataField,
          },
          { onConflict: 'recordId,fieldId', returning: 'minimal' },
        )
        .match({ recordId: input.recordId, fieldId: input.fieldId });

      if (cellError) {
        throw new trpc.TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: cellError.message,
        });
      }

      // insert change obj
      const change: RecordChange = {
        type: 'update',
        userId: ctx?.user.id ?? '',
        sheetId: recordData.sheetId,
        recordId: Number(recordData.id),
        fieldId: input.fieldId,
        value: input.data,
        modifiedAt: now,
      };

      await supabase
        .from<RecordChange>(Collections.RECORD_CHANGE)
        .insert(change, { returning: 'minimal' });
    },
  })
  .mutation('delete', {
    input: z.object({
      recordId: z.number(),
    }),
    async resolve({ input, ctx }) {
      // NOTE: cells should be auto deleted because of postgres cascade
      const { error, data } = await supabase
        .from<Record>(Collections.RECORDS)
        .delete()
        .eq('id', input.recordId);

      if (error || !data) {
        throw new trpc.TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
        });
      }

      // insert change obj
      const change: RecordChange = {
        type: 'delete',
        userId: ctx?.user.id ?? '',
        sheetId: data[0].sheetId,
        recordId: Number(data[0].id),
        modifiedAt: new Date(),
      };

      await supabase
        .from<RecordChange>(Collections.RECORD_CHANGE)
        .insert(change, { returning: 'minimal' });
    },
  });
