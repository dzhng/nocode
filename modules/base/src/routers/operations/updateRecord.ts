import * as trpc from '@trpc/server';
import { Collections, Record } from 'shared/schema';
import supabase from '~/utils/supabase';

export default async function updateRecord(record: Partial<Record>) {
  if (!record.slug || !record.sheetId) {
    throw new Error('Incorrect data for update record');
  }

  if (record.cells) {
    throw new Error('Do not update record cell data directly, use update_cell operation');
  }

  const { error } = await supabase
    .from<Record>(Collections.RECORDS)
    .update(record, { returning: 'minimal' })
    .match({ slug: record.slug, sheetId: record.sheetId });

  if (error) {
    throw new trpc.TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
    });
  }
}
