import { NextApiRequest, NextApiResponse } from 'next';
import supabase from '~/utils/supabase';

// sets auth cookies on client browser
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  supabase.auth.api.setAuthCookie(req, res);
}
