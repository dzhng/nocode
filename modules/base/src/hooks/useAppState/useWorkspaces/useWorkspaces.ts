import { useEffect, useState, useCallback } from 'react';
import firebase, { db } from '~/utils/firebase';
import { Collections, User, Workspace, Member, LocalModel } from '~/firebase/schema-types';
import useFirebaseAuth from '../useFirebaseAuth/useFirebaseAuth';

export default function useWorkspaces() {
  const { user, isAuthReady } = useFirebaseAuth();
  const [workspaces, setWorkspaces] = useState<LocalModel<Workspace>[]>([]);
  const [userRecord, setUserRecord] = useState<User | null>(null);
  const [workspaceIds, setWorkspaceIds] = useState<string[] | null>(null);
  const [isWorkspacesReady, setIsWorkspacesReady] = useState(false);

  useEffect(() => {
    if (!(isAuthReady && user)) {
      return;
    }

    const unsubscribe = db
      .collection(Collections.USERS)
      .doc(user.uid)
      .onSnapshot((snapshot) => {
        const data = snapshot.data() as User;
        setUserRecord(data);
      });

    return unsubscribe;
  }, [isAuthReady, user]);

  useEffect(() => {
    if (!(isAuthReady && user)) {
      return;
    }

    const unsubscribe = db
      .collectionGroup(Collections.MEMBERS)
      .where('memberId', '==', user.uid)
      .where('role', '!=', 'deleted')
      .onSnapshot((snapshot) => {
        const ids = snapshot.docs.map((doc) => doc.ref.parent.parent!.id);
        setWorkspaceIds(ids);
      });

    return unsubscribe;
  }, [isAuthReady, user]);

  useEffect(() => {
    const queryWorkspaces = async () => {
      if (workspaceIds && workspaceIds.length <= 0) {
        setWorkspaces([]);
        setIsWorkspacesReady(true);
        return;
      }

      setIsWorkspacesReady(false);

      const workspaceDocs = await db
        .collection(Collections.WORKSPACES)
        .where(firebase.firestore.FieldPath.documentId(), 'in', workspaceIds)
        .get();
      const records = workspaceDocs.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as LocalModel<Workspace>),
      );

      setWorkspaces(records);
      setIsWorkspacesReady(true);
    };

    if (workspaceIds !== null) {
      queryWorkspaces();
    }
  }, [workspaceIds]);

  const setCurrentWorkspaceId = useCallback(
    (workspaceId: string | null) => {
      if (user) {
        db.collection(Collections.USERS).doc(user.uid).update({
          defaultWorkspaceId: workspaceId,
        });
      }
    },
    [user],
  );

  const createWorkspace = useCallback(
    async (name: string): Promise<LocalModel<Workspace>> => {
      if (!user) {
        return Promise.reject('User is not authenticated');
      }

      setIsWorkspacesReady(false);
      const batch = db.batch();

      const newWorkspaceRef = db.collection(Collections.WORKSPACES).doc();
      const workspaceData: Workspace = {
        name,
        isDeleted: false,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      };
      batch.set(newWorkspaceRef, workspaceData);

      // set the new workspace as the new default
      const userRef = db.collection(Collections.USERS).doc(user.uid);
      const userData = {
        defaultWorkspaceId: newWorkspaceRef.id,
      };
      batch.update(userRef, userData);

      const memberRef = newWorkspaceRef.collection(Collections.MEMBERS).doc(user.uid);
      const memberData: Member = {
        memberId: user.uid,
        role: 'owner',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      };
      batch.set(memberRef, memberData);

      await batch.commit();
      setIsWorkspacesReady(true);

      return {
        id: newWorkspaceRef.id,
        name,
        createdAt: new Date(),
      } as LocalModel<Workspace>;
    },
    [user],
  );

  // when exporting current workspace, make sure to always export one that is still in workspaces array
  const currentWorkspaceId = workspaces.find(
    (workspace) => workspace.id === userRecord?.defaultWorkspaceId,
  )
    ? userRecord?.defaultWorkspaceId
    : workspaces.length > 0
    ? workspaces[0].id
    : undefined;

  return {
    userRecord,
    workspaces,
    isWorkspacesReady,
    currentWorkspaceId,
    setCurrentWorkspaceId,
    createWorkspace,
  };
}
