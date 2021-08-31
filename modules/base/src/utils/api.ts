import { NextApiRequest, NextApiResponse } from 'next';
import { User } from '@supabase/supabase-js';
import supabase from '~/utils/supabase';

export const withAuth = (
  handler: (req: NextApiRequest, res: NextApiResponse, user: User) => Promise<void>,
) => async (req: NextApiRequest, res: NextApiResponse) => {
  const { user, error } = await supabase.auth.api.getUserByCookie(req);
  if (error || !user) {
    return res.status(401).end();
  }

  return handler(req, res, user);
};
