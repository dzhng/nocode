import * as trpc from '@trpc/server';
import * as trpcNext from '@trpc/server/adapters/next';
import superjson from 'superjson';
import supabase from '~/utils/supabase';

import recordRouter from '~/routers/record';
import sheetRouter from '~/routers/sheet';

async function createContext({ req }: trpcNext.CreateNextContextOptions) {
  const { user, error } = await supabase.auth.api.getUserByCookie(req);
  if (error || !user) {
    return null;
  }

  return {
    user,
  };
}
export type Context = trpc.inferAsyncReturnType<typeof createContext>;

const appRouter = trpc
  .router<Context>()
  .middleware(async ({ ctx, next }) => {
    if (!ctx?.user) {
      throw new trpc.TRPCError({ code: 'UNAUTHORIZED' });
    }
    return next();
  })
  .transformer(superjson)
  .merge('record.', recordRouter)
  .merge('sheet.', sheetRouter);

// export type definition of API
export type AppRouter = typeof appRouter;

// export API handler
export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext,
});
