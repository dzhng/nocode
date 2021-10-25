import * as trpc from '@trpc/server';
import { differenceWith } from 'lodash';
import { Collections, Sheet, Cell, FieldType } from 'shared/schema';
import supabase from '~/utils/supabase';

// TODO: if field is deleted, update all records & cells as well
// TODO: maybe queue this up as a background job for later
export default async function updateField(sheetId: number, fields: FieldType[]) {
  const { data, error } = await supabase
    .from<Sheet>(Collections.SHEETS)
    .select('fields')
    .eq('id', sheetId)
    .single();
  if (!data || error) {
    throw new trpc.TRPCError({
      code: 'NOT_FOUND',
    });
  }

  const { error: updateError } = await supabase
    .from<Sheet>(Collections.SHEETS)
    .update({ fields }, { returning: 'minimal' })
    .eq('id', sheetId);

  if (updateError) {
    throw new trpc.TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
    });
  }

  // find any fields that were removed
  const removedFields = differenceWith(data.fields, fields, (a, b) => a.id === b.id);

  if (removedFields.length > 0) {
    await Promise.all(
      removedFields.map((field) =>
        supabase
          .from<Cell>(Collections.CELLS)
          .delete({ returning: 'minimal' })
          .match({ fieldId: field.id }),
      ),
    );
  }
}
