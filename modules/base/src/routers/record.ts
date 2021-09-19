import * as trpc from '@trpc/server';
import { z } from 'zod';
import { RecordSchema } from 'shared/schema';

export default trpc
  .router()
  .query('hello', {
    input: z.object({
      text: z.string().nullish(),
    }),
    resolve({ input }) {
      return {
        greeting: `hello ${input?.text ?? 'world'}`,
      };
    },
  })
  .mutation('create', {
    input: RecordSchema,
    async resolve({ input }) {},
  });
