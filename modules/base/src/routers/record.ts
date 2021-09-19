import * as trpc from '@trpc/server';
import { forEach } from 'lodash';
import { z } from 'zod';
import { Collections, Sheet, Record, RecordSchema, DataTypes, Cell } from 'shared/schema';
import { makeRecordDataSchema, CellData } from 'shared/schema/record';
import supabase from '~/utils/supabase';
import { dataFieldForCell } from '~/utils/record';

export default trpc
  .router()
  .query('hello', {
    input: z.object({
      text: z.string().nullish(),
    }),
    resolve({ input }) {
      return {
        greeting: `hello ${input?.text ?? 'world'}`,
      };
    },
  })
  .mutation('create', {
    input: z.object({
      record: RecordSchema,
      data: z.any(),
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
        const dataSchema = makeRecordDataSchema(sheetData);
        const parsed = dataSchema.safeParse(data);
        if (!parsed.success) {
          console.warn('Error parsing data on record create');
          return;
        }

        // build an array of cell objects from the data
        const cells: Cell[] = [];
        forEach(parsed.data, (value: CellData) => {
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

        await Promise.all(
          cells.map((cell) => {
            return supabase.from<Cell>(Collections.CELLS).insert(cell, { returning: 'minimal' });
          }),
        ).catch((e) => {
          console.warn('Error inserting cell data', e);
        });
      }
    },
  });
