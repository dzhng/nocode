import * as trpc from '@trpc/server';
import { z } from 'zod';
import { Collections, Sheet, RecordChange, FieldTypeSchema } from 'shared/schema';
import supabase from '~/utils/supabase';
import type { Context } from '~/pages/api/trpc/[trpc]';

export default trpc.router<Context>().mutation('updateField', {
  input: z.object({
    sheetId: z.number(),
    fields: FieldTypeSchema.array(),
  }),
  async resolve({ input, ctx }) {
    const { error } = await supabase
      .from<Sheet>(Collections.SHEETS)
      .update({ fields: input.fields }, { returning: 'minimal' })
      .eq('id', input.sheetId);

    if (error) {
      throw new trpc.TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
      });
    }

    const change: RecordChange = {
      type: 'field',
      userId: ctx?.user.id ?? '',
      sheetId: input.sheetId,
      value: input.fields,
      modifiedAt: new Date(),
    };

    await supabase
      .from<RecordChange>(Collections.RECORD_CHANGE)
      .insert(change, { returning: 'minimal' });
  },
});
