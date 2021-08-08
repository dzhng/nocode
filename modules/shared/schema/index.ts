export enum Collections {
  USER_DETAILS = 'users',
  WORKSPACES = 'workspaces',
  MEMBERS = 'members',
  INVITES = 'invites',
}

// extends the type with properties that is needed for client operations (such as id)
// becareful with this in components that deal with saving because it is very easy to get into a situation where you end up saving data that's extended for local, which would be rejected on server.
export type LocalModel<T> = T & { id: string };

export declare interface UserDetails {
  id: string;
  displayName: string;
  email?: string | null;
  photoURL?: string | null;
  bio?: string | null;
  defaultWorkspaceId?: string;
}

export declare interface Workspace {
  name: string;
  logoURL?: string | null;
  primaryColor?: string | null;
  backgroundColor?: string | null;
  isDeleted: boolean;
  createdAt: Date;
}

export type MemberRoles = 'owner' | 'member' | 'deleted';

export declare interface Member {
  memberId: string;
  role: MemberRoles;
  createdAt: Date;
}

export declare interface Invite {
  inviterId: string;
  email: string;
  createdAt: Date;
}
