import fetch from 'isomorphic-unfetch';
import { renderHook } from '@testing-library/react-hooks';
import { TWILIO_TOKEN_ENDPOINT } from '~/constants';
import useFirebaseAuth from './useFirebaseAuth';

const mockUser = { getIdToken: () => Promise.resolve('idToken') };

jest.mock('firebase/app', () => {
  const mockAuth = () => ({
    onAuthStateChanged: (fn: Function) => setImmediate(() => fn('mockUser')),
    signInWithPopup: jest.fn(() => Promise.resolve({ user: mockUser })),
    signOut: jest.fn(() => Promise.resolve()),
  });
  mockAuth.GoogleAuthProvider = jest.fn(() => ({ addScope: jest.fn() }));

  return {
    auth: mockAuth,
    initializeApp: jest.fn(),
    firestore: () => null,
  };
});

jest.mock('isomorphic-unfetch');
jest.mock('firebase/auth');

const mockFetch = fetch as jest.Mock<any>;
mockFetch.mockImplementation(() => Promise.resolve({ text: () => 'mockVideoToken' }));

describe('the useFirebaseAuth hook', () => {
  it('should set isAuthReady to true and set a user on load', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useFirebaseAuth());
    expect(result.current.isAuthReady).toBe(false);
    expect(result.current.user).toBe(null);
    await waitForNextUpdate();
    expect(result.current.isAuthReady).toBe(true);
    expect(result.current.user).toBe('mockUser');
  });

  it('should set user to null on signOut', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useFirebaseAuth());
    await waitForNextUpdate();
    result.current.signOut();
    await waitForNextUpdate();
    expect(result.current.isAuthReady).toBe(true);
    expect(result.current.user).toBe(null);
  });

  it('should set a new user on signIn', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useFirebaseAuth());
    await waitForNextUpdate();
    result.current.signIn();
    await waitForNextUpdate();
    expect(result.current.user).toBe(mockUser);
  });

  it('should include the users idToken in request to the video token server', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useFirebaseAuth());
    await waitForNextUpdate();
    result.current.signIn();
    await waitForNextUpdate();
    await result.current.getToken('testroom');
    expect(mockFetch).toHaveBeenCalledWith(TWILIO_TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        idToken: 'idToken',
        roomName: 'testroom',
      }),
    });
  });
});
