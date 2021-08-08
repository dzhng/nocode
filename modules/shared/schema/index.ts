// make sure this typescript schema aligns with schema.sql

export enum Collections {
  USER_DETAILS = 'public.users',
  WORKSPACES = 'public.workspaces',
  MEMBERS = 'public.members',
  INVITES = 'public.invites',
}

export declare interface UserDetails {
  id?: string;
  displayName?: string;
  email?: string | null;
  photoURL?: string | null;
  bio?: string | null;
  defaultWorkspaceId?: string;
  createdAt: Date;
}

export declare interface Workspace {
  id?: string;
  name: string;
  isDeleted: boolean;
  createdAt: Date;
}

export type MemberRoles = 'owner' | 'member' | 'deleted';

export declare interface Member {
  id?: string;
  workspaceId: string;
  memberId: string;
  role: MemberRoles;
  createdAt: Date;
}

export declare interface Invite {
  id?: string;
  workspaceId: string;
  inviterId: string;
  email: string;
  createdAt: Date;
}
