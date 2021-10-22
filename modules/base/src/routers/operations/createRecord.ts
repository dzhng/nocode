import * as trpc from '@trpc/server';
import { Collections, Sheet, Record, Cell } from 'shared/schema';
import supabase from '~/utils/supabase';
import { dataFieldForCell } from '~/utils/record';

export default async function createRecord(record: Record) {
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
    });

    await supabase.from<Cell>(Collections.CELLS).insert(cells, { returning: 'minimal' });
  }
}
