import { z } from 'zod';
import { CellTypeSchema, Record, RecordSchema, Sheet } from './index';

// defines a JSON representation of the record schema that can be sent over the wire, without having do define the data for each individual cells

export const CellDataSchema = z.object({
  id: z.number(),
  data: CellTypeSchema,
  createdAt: z.date(),
  modifiedAt: z.date(),
});
export type CellData = z.infer<typeof CellDataSchema>;

export const GenerateRecordDataSchema = (sheet: Sheet) => {
  const schema = z.object({});
  sheet.columns.reduce((prev, column) => {
    if (!column.id) return prev;
    return prev.extend({
      [column.id]: CellDataSchema,
    });
  }, schema);

  return RecordSchema.extend({
    data: schema,
  });
};

export interface RecordData extends Record {
  data?: {
    [columnId: string]: CellData | undefined;
  };
}
