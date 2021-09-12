import { screen, render } from '@testing-library/react';
import { useRouter } from 'next/router';
import useGlobalState from '~/hooks/useGlobalState';
import PrivateRoute from './PrivateRoute';

jest.mock('next/router');
jest.mock('~/hooks/useGlobalState');

const mockUseState = useGlobalState as jest.Mock<any>;
const mockUseRouter = useRouter as jest.Mock<any>;
const MockComponent = () => <h1 data-testid="mock">test</h1>;

const mockPush = jest.fn();
mockUseRouter.mockImplementation(() => ({ push: mockPush }));

describe('the PrivateRoute component', () => {
  describe('with auth enabled', () => {
    describe('when isAuthReady is true', () => {
      it('should redirect to /login when there is no user', () => {
        mockUseState.mockImplementation(() => ({ user: false, isAuthReady: true }));
        render(
          <PrivateRoute>
            <MockComponent />
          </PrivateRoute>,
        );
        expect(mockPush).toHaveBeenCalledWith('/login');
        expect(screen.queryByTestId('mock')).not.toBeInTheDocument();
      });

      it('should render children when there is a user', () => {
        mockUseState.mockImplementation(() => ({ user: {}, isAuthReady: true }));
        render(
          <PrivateRoute>
            <MockComponent />
          </PrivateRoute>,
        );
        expect(screen.queryByTestId('mock')).toBeInTheDocument();
      });
    });

    describe('when isAuthReady is false', () => {
      it('should not render children', () => {
        mockUseState.mockImplementation(() => ({ user: false, isAuthReady: false }));
        render(
          <PrivateRoute>
            <MockComponent />
          </PrivateRoute>,
        );
        expect(screen.queryByTestId('mock')).not.toBeInTheDocument();
      });
    });
  });
});
