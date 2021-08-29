import { useEffect, useState, useCallback } from 'react';
import { Collections, Workspace, Member, UserDetails } from 'shared/schema';
import supabase from '~/utils/supabase';
import { useAppState } from '~/hooks/useAppState';

export default function useWorkspaceMembers(workspaceId?: string) {
  const { user } = useAppState();
  const [members, setMembers] = useState<UserDetails[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);

  useEffect(() => {
    const loadMemberUsers = async () => {
      const ret = await supabase
        .from<Member & { user: UserDetails }>(Collections.MEMBERS)
        .select(
          ` *,
            user:${Collections.USER_DETAILS}(*)
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

    setIsLoadingMembers(true);
    if (!workspaceId) {
      return;
    }

    loadMemberUsers();
  }, [workspaceId, user]);

  const addMembers = useCallback(
    async (emails: string[]) => {
      if (!currentWorkspaceId || !user || emails.length === 0) {
        return;
      }

      // creating an invite model will trigger cloud functions to do the rest
      const batch = db.batch();
      emails.forEach((email) => {
        const ref = db
          .collection(Collections.WORKSPACES)
          .doc(currentWorkspaceId)
          .collection(Collections.INVITES)
          .doc();

        const inviteData: Invite = {
          inviterId: user.uid,
          email,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        };
        batch.set(ref, inviteData);
      });

      await batch.commit();
    },
    [currentWorkspaceId, user],
  );

  const removeMembers = useCallback(
    async (ids: string[]) => {
      if (!currentWorkspaceId || ids.length === 0) {
        return;
      }

      const batch = db.batch();
      ids.forEach((id) => {
        const ref = db
          .collection(Collections.WORKSPACES)
          .doc(currentWorkspaceId)
          .collection(Collections.MEMBERS)
          .doc(id);

        batch.update(ref, {
          role: 'deleted',
        });
      });

      await batch.commit();
    },
    [currentWorkspaceId],
  );
}
