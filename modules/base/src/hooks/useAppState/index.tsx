import { createContext, useContext, useState } from 'react';
import { User, Workspace, LocalModel } from 'shared/schema';

import useWorkspaces from './useWorkspaces/useWorkspaces';

export interface StateContextType {
  error: Error | string | null;
  setError(error: Error | string | null): void;

  // auth
  getToken(room: string): Promise<string>;
  user?: User | null;
  signInWithEmailAndPassword(name: string, password: string): Promise<User | null>;
  signInWithGoogle(): Promise<User | null>;
  signInAnonymously(displayName: string): Promise<User | null>;
  signOut(): Promise<void>;
  isAuthReady?: boolean;
  isFetching: boolean;
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
  const [isFetching, setIsFetching] = useState(false);

  let contextValue = {
    error,
    setError,
    isFetching,
  } as StateContextType;

  contextValue = {
    ...contextValue,
    //...useWorkspaces(),
  };

  const getToken: StateContextType['getToken'] = async (room) => {
    setIsFetching(true);
    try {
      const res = await contextValue.getToken(room);
      setIsFetching(false);
      return res;
    } catch (err) {
      setError(err);
      setIsFetching(false);
      return Promise.reject(err);
    }
  };

  return (
    <StateContext.Provider value={{ ...contextValue, getToken }}>
      {props.children}
    </StateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(StateContext);
  if (!context) {
    throw new Error('useAppState must be used within the AppStateProvider');
  }
  return context;
}
