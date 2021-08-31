// make sure this typescript schema aligns with schema.sql

export enum Collections {
  USER_DETAILS = 'users',
  WORKSPACES = 'workspaces',
  MEMBERS = 'members',
  INVITES = 'invites',
  APPS = 'apps',
}

/**
 * Admin schemas
 */

export declare interface UserDetails {
  id?: string;
  displayName?: string;
  email?: string | null;
  photoURL?: string | null;
  bio?: string | null;
  defaultWorkspaceId?: number;
  createdAt: Date;
}

export declare interface Workspace {
  id?: number;
  name: string;
  isDeleted: boolean;
  createdAt: Date;
}

export type MemberRoles = 'owner' | 'member' | 'deleted';

export declare interface Member {
  id?: number;
  workspaceId: number;
  userId: string;
  role: MemberRoles;
  createdAt: Date;
}

export declare interface Invite {
  id?: number;
  workspaceId: number;
  inviterId: string;
  email: string;
  createdAt: Date;
}

/**
 * Data schemas
 */

export declare interface App {
  id?: number;
  name: string;
  workspaceId: number;
  creatorId: string;
  isDeleted: boolean;
  createdAt: Date;
}
