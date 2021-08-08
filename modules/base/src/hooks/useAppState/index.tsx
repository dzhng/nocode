import { createContext, useContext, useState } from 'react';
import { UserDetails, Workspace, LocalModel } from 'shared/schema';
import { User } from '@supabase/supabase-js';

import useWorkspaces from './useWorkspaces';
import useAuth from './useAuth';

export interface StateContextType {
  error: Error | string | null;
  setError(error: Error | string | null): void;

  // auth
  user?: User | null;
  userDetails?: UserDetails | null;
  signInWithEmailAndPassword(name: string, password: string): Promise<User | null>;
  signOut(): Promise<void>;
  isAuthReady?: boolean;
  register(email: string, password: string, name: string): Promise<User | null>;

  // workspaces
  currentWorkspaceId?: string | null;
  setCurrentWorkspaceId(workspaceId: string | null): void;
  workspaces?: LocalModel<Workspace>[];
  isWorkspacesReady: boolean;
  createWorkspace(name: string): Promise<LocalModel<Workspace>>;
}

export const StateContext = createContext<StateContextType>(null!);

export function AppStateProvider(props: React.PropsWithChildren<{}>) {
  const [error, setError] = useState<Error | string | null>(null);

  const contextValue: StateContextType = {
    error,
    setError,
    ...useAuth(),
    ...useWorkspaces(),
  };

  return <StateContext.Provider value={contextValue}>{props.children}</StateContext.Provider>;
}

export function useAppState() {
  const context = useContext(StateContext);
  if (!context) {
    throw new Error('useAppState must be used within the AppStateProvider');
  }
  return context;
}
