import * as trpc from '@trpc/server';
import { omit } from 'lodash';
import { Collections, Record, Sheet, Cell, CellType } from 'shared/schema';
import supabase from '~/utils/supabase';
import { dataFieldForCell } from '~/utils/record';

export default async function updateCell(
  sheetId: number,
  slug: string,
  fieldId: string,
  data: CellType,
) {
  // fetch the sheet to get field info
  const { data: recordData } = await supabase
    .from<Record & { sheet: Sheet }>(Collections.RECORDS)
    .select(
      ` *,
        sheet:sheetId (*) 
      `,
    )
    .match({ slug, sheetId })
    .single();
  if (!recordData) {
    throw new trpc.TRPCError({
      code: 'NOT_FOUND',
    });
  }

  const field = recordData.sheet.fields.find((c) => c.id === fieldId);
  if (!field) {
    throw new trpc.TRPCError({
      code: 'NOT_FOUND',
    });
  }

  // modify record
  const newRecord: Record = omit(recordData, 'sheet');
  newRecord.cells = [...(newRecord.cells?.filter(([id]) => id !== fieldId) ?? []), [fieldId, data]];

  const { error: recordError } = await supabase
    .from<Record>(Collections.RECORDS)
    .update(newRecord, { returning: 'minimal' })
    .match({ slug, sheetId });

  if (recordError) {
    throw new trpc.TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: recordError.message,
    });
  }

  // upsert cell
  const dataField = dataFieldForCell(field, data);
  const { error: cellError } = await supabase
    .from<Cell>(Collections.CELLS)
    .upsert(
      {
        recordId: recordData.id,
        fieldId: fieldId,
        ...dataField,
      },
      { onConflict: 'recordId,fieldId', returning: 'minimal' },
    )
    .match({ recordId: recordData.id, fieldId: fieldId });

  if (cellError) {
    throw new trpc.TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: cellError.message,
    });
  }
}
