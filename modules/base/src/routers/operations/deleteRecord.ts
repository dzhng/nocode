import * as trpc from '@trpc/server';
import { Collections, Record } from 'shared/schema';
import supabase from '~/utils/supabase';

export default async function deleteRecord(sheetId: number, slug: string) {
  // NOTE: cells should be auto deleted because of postgres cascade
  const { error, data } = await supabase
    .from<Record>(Collections.RECORDS)
    .delete()
    .match({ sheetId, slug });

  if (error || !data) {
    throw new trpc.TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
    });
  }
}
