import * as trpc from '@trpc/server';
import { z } from 'zod';
import { Collections, Record, Operation } from 'shared/schema';
import supabase from '~/utils/supabase';
import type { Context } from '~/pages/api/trpc/[trpc]';

export default trpc.router<Context>().query('downloadRecords', {
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
        message: recordRet.error.message,
      });
    }

    // get latest operation and return alongside, so client knows where to start querying for new events
    const operationRet = await supabase
      .from<Operation>(Collections.OPERATIONS)
      .select('*')
      .eq('sheetId', sheetId)
      .order('id', { ascending: false })
      .limit(1);
    if (operationRet.error) {
      throw new trpc.TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: operationRet.error.message,
      });
    }

    return {
      records: recordRet.data,
      latestOp: operationRet.data.length > 0 ? operationRet.data[0] : undefined,
    };
  },
});
