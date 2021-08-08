import { useEffect, useState, useCallback } from 'react';
import { Collections, Workspace, Member } from 'shared/schema';
import supabase from '~/utils/supabase';
import useAuth from '../useAuth';

export default function useWorkspaces() {
  const { user, userDetails, isAuthReady } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspaceId, _setCurrentWorkspaceId] = useState<string | null>(null);
  const [isWorkspacesReady, setIsWorkspacesReady] = useState(false);

  // make sure currentWorkspaceId is always up to date when user details changes
  useEffect(() => {
    if (userDetails) {
      _setCurrentWorkspaceId(userDetails?.defaultWorkspaceId ?? null);
    }
  }, [userDetails]);

  const queryForWorkspaces = useCallback(async () => {
    setWorkspaces([]);
    setIsWorkspacesReady(false);

    if (!(isAuthReady && user)) {
      return;
    }

    const ret = await supabase
      .from<Member & { workspace: Workspace }>(Collections.MEMBERS)
      .select(
        ` *,
          workspace:${Collections.WORKSPACES}(*)
        `,
      )
      .eq('memberId', user.id)
      .neq('role', 'deleted');

    if (ret.error || !ret.data) {
      setIsWorkspacesReady(false);
      setWorkspaces([]);
      return;
    }

    setWorkspaces(ret.data.map((data) => data.workspace));
    setIsWorkspacesReady(true);
  }, [isAuthReady, user]);

  const setCurrentWorkspaceId = useCallback(
    async (workspaceId: string | null) => {
      if (user) {
        _setCurrentWorkspaceId(workspaceId);
        await supabase
          .from(Collections.USER_DETAILS)
          .update(
            {
              defaultWorkspaceId: workspaceId,
            },
            { returning: 'minimal' },
          )
          .eq('id', user.id);
      }
    },
    [user],
  );

  const createWorkspace = useCallback(
    async (name: string): Promise<Workspace | undefined> => {
      if (!user) {
        return Promise.reject('User is not authenticated');
      }

      setIsWorkspacesReady(false);

      const workspaceData: Workspace = {
        name,
        isDeleted: false,
        createdAt: new Date(),
      };

      const workspaceRet = await supabase
        .from<Workspace>(Collections.WORKSPACES)
        .insert(workspaceData);
      if (workspaceRet.error || !workspaceRet.data || workspaceRet.data.length === 0) {
        return;
      }

      const createdWorkspace = workspaceRet.data[0];
      if (!createdWorkspace.id) {
        return;
      }

      const memberData: Member = {
        workspaceId: createdWorkspace.id,
        memberId: user.id,
        role: 'owner',
        createdAt: new Date(),
      };

      // add new workspace to list of workspaces
      await supabase.from(Collections.MEMBERS).insert(memberData);

      // requery workspace list
      await queryForWorkspaces();

      // set the new workspace as the new default
      await setCurrentWorkspaceId(createdWorkspace.id);

      setIsWorkspacesReady(true);

      return {
        id: createdWorkspace.id,
        name,
        createdAt: new Date(),
      } as Workspace;
    },
    [user, queryForWorkspaces, setCurrentWorkspaceId],
  );

  // when exporting current workspace, make sure to always export one that is still in workspaces array
  const calculatedCurrentWorkspaceId = workspaces.find(
    (workspace) => workspace.id === currentWorkspaceId,
  )
    ? currentWorkspaceId
    : workspaces.length > 0
    ? workspaces[0].id
    : undefined;

  const currentWorkspace = workspaces?.find((model) => model.id === calculatedCurrentWorkspaceId);

  return {
    queryForWorkspaces,
    workspaces,
    isWorkspacesReady,
    currentWorkspaceId: calculatedCurrentWorkspaceId,
    currentWorkspace,
    setCurrentWorkspaceId,
    createWorkspace,
  };
}
