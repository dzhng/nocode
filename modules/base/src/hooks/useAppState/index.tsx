import React, { createContext, useContext, useState } from 'react';
import firebase from 'firebase';
import { User, Workspace, LocalModel } from 'shared/schema';

import useFirebaseAuth from './useFirebaseAuth/useFirebaseAuth';
import useWorkspaces from './useWorkspaces/useWorkspaces';

export interface StateContextType {
  error: Error | string | null;
  setError(error: Error | string | null): void;

  // auth
  getToken(room: string): Promise<string>;
  user?: firebase.User | null;
  signInWithEmailAndPassword(name: string, password: string): Promise<firebase.User | null>;
  signInWithGoogle(): Promise<firebase.User | null>;
  signInAnonymously(displayName: string): Promise<firebase.User | null>;
  signOut(): Promise<void>;
  isAuthReady?: boolean;
  isFetching: boolean;
  register(email: string, password: string, name: string): Promise<firebase.User | null>;

  // workspaces
  currentWorkspaceId?: string | null;
  setCurrentWorkspaceId(workspaceId: string | null): void;
  userRecord?: User | null;
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
    ...useFirebaseAuth(),
    ...useWorkspaces(),
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
