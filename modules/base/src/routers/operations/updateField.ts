import * as trpc from '@trpc/server';
import { Collections, Sheet, FieldType } from 'shared/schema';
import supabase from '~/utils/supabase';

// TODO: if field is deleted, update all records & cells as well
// TODO: maybe queue this up as a background job for later
export default async function updateField(sheetId: number, fields: FieldType[]) {
  const { error } = await supabase
    .from<Sheet>(Collections.SHEETS)
    .update({ fields }, { returning: 'minimal' })
    .eq('id', sheetId);

  if (error) {
    throw new trpc.TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
    });
  }
}
