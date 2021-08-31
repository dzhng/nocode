import { NextApiRequest, NextApiResponse } from 'next';
import { capitalize, words } from 'lodash';
import assert from 'assert';
import * as yup from 'yup';
import { Collections, UserDetails, Workspace, Member, Invite } from 'shared/schema';
import supabase from '~/utils/supabase';

interface RequestBody {
  email: string;
  password: string;
  name: string;
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(400).end();
  }

  const body: RequestBody = req.body;
  assert(typeof body.email === 'string');
  assert(yup.string().email().isValidSync(body.email));
  assert(typeof body.name === 'string');
  assert(body.name.length > 0);
  assert(typeof body.password === 'string');
  assert(body.password.length > 6);

  const createdAt = new Date();

  const data = await supabase.auth.signUp({ email: body.email, password: body.password });
  if (data.error || !data.user) {
    return res.status(400).end();
  }

  // insert default workspace
  const firstName = capitalize(words(body.name)[0]);
  const workspaceData: Workspace = {
    name: `${firstName}'s Workspace`,
    isDeleted: false,
    createdAt,
  };

  const workspaceRet = await supabase.from<Workspace>(Collections.WORKSPACES).insert(workspaceData);
  if (workspaceRet.error || !workspaceRet.data[0].id) {
    console.error('Error inserting workspace record', workspaceRet.error);
    return res.status(400).end();
  }

  // insert user record to default workspace
  const memberData: Member = {
    workspaceId: workspaceRet.data[0].id,
    userId: data.user.id,
    role: 'owner',
    createdAt,
  };

  const memberRet = await supabase.from<Member>(Collections.MEMBERS).insert(memberData);
  if (memberRet.error) {
    console.error('Error inserting workspace member record', memberRet.error);
    return res.status(400).end();
  }

  // look at existing invites and see if user belongs to existing workspaces
  const invitesRet = await supabase
    .from<Invite>(Collections.INVITES)
    .select('*')
    .eq('email', data.user.email);
  if (invitesRet.error) {
    return res.status(400).end();
  }

  let lastInvitedWorkspaceId: number | undefined;
  const invites = invitesRet.data;
  await Promise.all(
    invites.map((invite) => {
      const memberData: Member = {
        workspaceId: invite.workspaceId,
        userId: data.user!.id,
        role: 'member',
        createdAt,
      };

      lastInvitedWorkspaceId = invite.workspaceId;

      // delete invite and add to members
      supabase.from<Invite>(Collections.INVITES).delete().eq('id', invite.id);
      return supabase.from<Member>(Collections.MEMBERS).insert(memberData);
    }),
  );

  // insert default user record
  const userData: UserDetails = {
    id: data.user.id,
    email: data.user.email,
    displayName: body.name,
    defaultWorkspaceId: lastInvitedWorkspaceId ?? workspaceRet.data[0].id,
    createdAt,
  };

  const userRet = await supabase.from<UserDetails>(Collections.USER_DETAILS).insert(userData);
  if (userRet.error) {
    console.error('Error inserting user record', userRet.error);
    return res.status(400).end();
  }

  return res.status(200).end();
};
