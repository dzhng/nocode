import { useEffect, useState, useCallback } from 'react';
import { Collections, Workspace, Member, UserDetails } from 'shared/schema';
import supabase from '~/utils/supabase';
import { useAppState } from '~/hooks/useAppState';

export default function useWorkspace() {
  const { user, currentWorkspaceId, setCurrentWorkspaceId, workspaces } = useAppState();
  const [members, setMembers] = useState<UserDetails[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);

  useEffect(() => {
    const loadMemberUsers = async (workspaceId: string) => {
      const memberRecords = await db
        .collection(Collections.WORKSPACES)
        .doc(workspaceId)
        .collection(Collections.MEMBERS)
        .get();

      const ids = memberRecords.docs.map((doc) => doc.id);
      // this case should not happen, but guard for it anyways to prevent firebase error
      if (ids.length <= 0) {
        setMembers([]);
        return;
      }

      // find own member record to check admin
      const myRecord = memberRecords.docs.find((doc) => doc.id === user?.uid);
      setIsAdmin(myRecord ? (myRecord.data() as Member).role === 'owner' : false);

      const userRecords = await db
        .collection(Collections.USERS)
        .where(firebase.firestore.FieldPath.documentId(), 'in', ids)
        .get();

      const users = userRecords.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as LocalModel<User>),
      );
      setMembers(users);
      setIsLoadingMembers(false);
    };

    setIsLoadingMembers(true);
    if (!currentWorkspaceId) {
      return;
    }

    loadMemberUsers(currentWorkspaceId);
  }, [currentWorkspaceId, user]);

  const leaveWorkspace = useCallback(() => {
    if (!user || !currentWorkspaceId) {
      return;
    }

    // remove self by changing role to deleted
    db.collection(Collections.WORKSPACES)
      .doc(currentWorkspaceId)
      .collection(Collections.MEMBERS)
      .doc(user.uid)
      .update({
        role: 'deleted',
      });

    // set a new current workspace
    const newCurrentWorkspace = workspaces?.find((model) => model.id !== currentWorkspaceId);
    setCurrentWorkspaceId(newCurrentWorkspace?.id ?? null);
  }, [user, currentWorkspaceId, setCurrentWorkspaceId, workspaces]);

  const deleteWorkspace = useCallback(() => {
    if (!currentWorkspaceId) {
      return;
    }

    // once the workspace doc is deleted, a cloud function will mark all members as deleted as well
    db.collection(Collections.WORKSPACES).doc(currentWorkspaceId).update({
      isDeleted: true,
    });

    // set a new current workspace
    const newCurrentWorkspace = workspaces?.find((model) => model.id !== currentWorkspaceId);
    setCurrentWorkspaceId(newCurrentWorkspace?.id ?? null);
  }, [currentWorkspaceId, setCurrentWorkspaceId, workspaces]);

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
