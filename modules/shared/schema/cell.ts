import { z } from 'zod';
import { CellTypeSchema } from './index';

export const CellDataSchema = z.object({
  columnId: z.number(),
  data: CellTypeSchema,
  createdAt: z.date(),
  modifiedAt: z.date(),
});
export type CellData = z.infer<typeof CellDataSchema>;
