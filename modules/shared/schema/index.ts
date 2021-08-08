export enum Collections {
  USER_DETAILS = 'users',
  WORKSPACES = 'workspaces',
  MEMBERS = 'members',
  INVITES = 'invites',
}

export declare interface UserDetails {
  id?: string;
  displayName: string;
  email?: string | null;
  photoURL?: string | null;
  bio?: string | null;
  defaultWorkspaceId?: string;
}

export declare interface Workspace {
  id?: string;
  name: string;
  logoURL?: string | null;
  primaryColor?: string | null;
  backgroundColor?: string | null;
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
