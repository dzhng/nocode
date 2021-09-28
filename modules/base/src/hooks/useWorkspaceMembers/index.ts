import { useEffect, useState, useCallback } from 'react';
import fetch from 'isomorphic-unfetch';
import { Collections, Member, UserDetails } from 'shared/schema';
import supabase from '~/utils/supabase';
import useGlobalState from '~/hooks/useGlobalState';

const INVITE_ENDPOINT = '/api/inviteMembers';

export default function useWorkspaceMembers(workspaceId?: number) {
  const { user } = useGlobalState();
  const [members, setMembers] = useState<UserDetails[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);

  useEffect(() => {
    const loadMemberUsers = async () => {
      setIsLoadingMembers(true);

      const ret = await supabase
        .from<Member & { user: UserDetails }>(Collections.MEMBERS)
        .select(
          ` *,
            user:userId (*)
          `,
        )
        .eq('workspaceId', workspaceId)
        .neq('role', 'deleted');

      if (ret.error || !ret.data) {
        setMembers([]);
        return;
      }

      // find own member record to check admin
      const myRecord = ret.data.find((doc) => doc.userId === user?.id);
      setIsAdmin(myRecord ? myRecord.role === 'owner' : false);

      setMembers(ret.data.map((data) => data.user));
      setIsLoadingMembers(false);
    };

    if (!workspaceId) {
      return;
    }

    loadMemberUsers();
  }, [workspaceId, user]);

  const inviteMembers = useCallback(
    async (emails: string[]) => {
      if (!workspaceId || !user || emails.length === 0) {
        return;
      }

      const params = JSON.stringify({ workspaceId, emails });

      await fetch(INVITE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: params,
      });

      return;
    },
    [workspaceId, user],
  );

  const removeMembers = useCallback(
    async (ids: string[]) => {
      if (!workspaceId || ids.length === 0) {
        return;
      }

      await supabase
        .from<Member>(Collections.MEMBERS)
        .update({ role: 'deleted' }, { returning: 'minimal' })
        .in('userId', ids);
    },
    [workspaceId],
  );

  return {
    members,
    isAdmin,
    isLoadingMembers,
    inviteMembers,
    removeMembers,
  };
}
