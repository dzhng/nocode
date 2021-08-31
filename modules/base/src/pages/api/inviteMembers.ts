import assert from 'assert';
import * as yup from 'yup';
import { Collections, Member } from 'shared/schema';
import supabase from '~/utils/supabase';
import { withAuth } from '~/utils/api';

interface RequestBody {
  workspaceId: number;
  emails: string[];
}

export default withAuth(async (req, res, user) => {
  if (req.method !== 'POST') {
    return res.status(400).end();
  }

  const body: RequestBody = req.body;
  assert(typeof body.workspaceId === 'number');
  assert(typeof body.emails === 'object');

  const emails = body.emails.filter((email) => yup.string().email().isValidSync(email));
  assert(emails.length > 0);

  // check if user has permission to invite
  const ret = await supabase
    .from<Member>(Collections.MEMBERS)
    .select('id', { count: 'exact' })
    .match({ workspaceId: body.workspaceId, userId: user.id });

  if (ret.count === null || ret.count < 1) {
    return res.status(401).end();
  }

  console.log('Inviting users with emails: ', body.emails);
  // cycle through each email, send invite email
  // TODO
});
