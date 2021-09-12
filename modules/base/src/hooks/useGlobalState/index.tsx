import { createContext, useContext, useState } from 'react';
import { UserDetails, Workspace } from 'shared/schema';
import { User } from '@supabase/supabase-js';

import useAuth from './useAuth';
import useWorkspaces from './useWorkspaces';

export interface StateContextType {
  error: Error | string | null;
  setError(error: Error | string | null): void;

  // auth
  user?: User | null;
  userDetails?: UserDetails | null;
  signInWithEmailAndPassword(name: string, password: string): Promise<User | null>;
  signInWithGoogle(): Promise<User | null>;
  signOut(): Promise<void>;
  isAuthReady?: boolean;
  register(email: string, password: string, name: string): Promise<void>;

  // workspaces
  currentWorkspaceId?: number;
  currentWorkspace?: Workspace;
  setCurrentWorkspaceId(workspaceId?: number): void;
  workspaces?: Workspace[];
  isWorkspacesReady: boolean;
  queryForWorkspaces(): Promise<void>;
  createWorkspace(name: string): Promise<Workspace | undefined>;
  leaveWorkspace(): Promise<void>;
  deleteWorkspace(): Promise<void>;
}

export const StateContext = createContext<StateContextType>(null!);

export function GlobalStateProvider(props: React.PropsWithChildren<{}>) {
  const [error, setError] = useState<Error | string | null>(null);

  const contextValue: StateContextType = {
    error,
    setError,
    ...useAuth(),
    ...useWorkspaces(),
  };

  return <StateContext.Provider value={contextValue}>{props.children}</StateContext.Provider>;
}

export default function useGlobalState() {
  const context = useContext(StateContext);
  if (!context) {
    throw new Error('useGlobalState must be used within the GlobalStateProvider');
  }
  return context;
}
