import React, { createContext, useContext, useState } from 'react';

interface ContextType {
  error: string | null | Error;
  setError(error: string | null | Error): void;
}

const StateContext = createContext<ContextType>(null!);

export function AppStateProvider(props: React.PropsWithChildren<{}>) {
  const [error, setError] = useState<string | null | Error>(null);

  const contextValue: ContextType = {
    error,
    setError,
  };

  return <StateContext.Provider value={contextValue}>{props.children}</StateContext.Provider>;
}

export function useAppState() {
  const context = useContext(StateContext);
  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider');
  }
  return context;
}
