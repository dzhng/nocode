import { act, renderHook } from '@testing-library/react-hooks';

import useGlobalState, { GlobalStateProvider } from './index';

const wrapper: React.FC = ({ children }) => <GlobalStateProvider>{children}</GlobalStateProvider>;

describe('the useGlobalState hook', () => {
  beforeEach(() => (process.env = {} as any));

  it('should set an error', () => {
    const { result } = renderHook(useGlobalState, { wrapper });
    act(() => result.current.setError(new Error('testError') as Error));
  });

  it('should throw an error if used outside of GlobalStateProvider', () => {
    const { result } = renderHook(useGlobalState);
    expect(result.error.message).toEqual(
      'useGlobalState must be used within the GlobalStateProvider',
    );
  });
});
