import React from 'react';
import { act, renderHook } from '@testing-library/react-hooks';

import AppStateProvider, { useAppState } from './index';
import useFirebaseAuth from './useFirebaseAuth/useFirebaseAuth';

jest.mock('./useFirebaseAuth/useFirebaseAuth', () => jest.fn(() => ({ user: 'firebaseUser' })));

// @ts-ignore
window.fetch = jest.fn(() => Promise.resolve({ text: () => 'mockVideoToken' }));

const wrapper: React.FC = ({ children }) => <AppStateProvider>{children}</AppStateProvider>;

describe('the useAppState hook', () => {
  beforeEach(() => (process.env = {} as any));

  it('should set an error', () => {
    const { result } = renderHook(useAppState, { wrapper });
    act(() => result.current.setError(new Error('testError') as Error));
    expect(result.current.error!.message).toBe('testError');
  });

  it('should throw an error if used outside of AppStateProvider', () => {
    const { result } = renderHook(useAppState);
    expect(result.error.message).toEqual('useAppState must be used within the AppStateProvider');
  });

  it('should use the useFirebaseAuth hook', async () => {
    const { result } = renderHook(useAppState, { wrapper });
    expect(useFirebaseAuth).toHaveBeenCalled();
    expect(result.current.user).toBe('firebaseUser');
  });
});
