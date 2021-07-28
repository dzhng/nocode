import React from 'react';
import { screen, render, within } from '@testing-library/react';
import fireEvent from '@testing-library/user-event';
import { useAppState } from '~/state';
import useVideoContext from '~/hooks/Video/useVideoContext/useVideoContext';
import Menu from './Menu';

jest.mock('~/state');
jest.mock('~/hooks/Video/useVideoContext/useVideoContext');

const mockUseAppState = useAppState as jest.Mock<any>;
const mockUseVideoContext = useVideoContext as jest.Mock<any>;

describe('the Menu component', () => {
  const mockDisconnect = jest.fn();
  const mockTrack = { stop: jest.fn() };
  mockUseVideoContext.mockImplementation(() => ({
    room: { disconnect: mockDisconnect },
    localTracks: [mockTrack],
  }));

  describe('when there is a user', () => {
    it('should render the UserAvatar component', () => {
      mockUseAppState.mockImplementation(() => ({ user: {}, signOut: jest.fn() }));
      render(<Menu />);
      expect(screen.queryByTestId('avatar')).toBeInTheDocument();
    });

    it('should include the logout button in the menu', () => {
      mockUseAppState.mockImplementation(() => ({
        user: { displayName: 'Test User' },
        signOut: jest.fn(),
      }));
      render(<Menu />);
      fireEvent.click(screen.getByTestId('avatar'));
      const menu = screen.getByTestId('menu');
      expect(within(menu).queryByRole('menuitem', { name: /logout/i })).toBeInTheDocument();
    });

    it('should display the user name in the menu', () => {
      mockUseAppState.mockImplementation(() => ({
        user: { displayName: 'Test User' },
        signOut: jest.fn(),
      }));
      render(<Menu />);
      fireEvent.click(screen.getByTestId('avatar'));
      const menu = screen.getByTestId('menu');
      expect(within(menu).queryByRole('menuitem', { name: 'Test User' })).toBeInTheDocument();
    });

    it('should disconnect from the room and stop all tracks on signout', () => {
      const mockSignOut = jest.fn(() => Promise.resolve());
      mockUseAppState.mockImplementation(() => ({
        user: { displayName: 'Test User' },
        signOut: mockSignOut,
      }));
      render(<Menu />);
      fireEvent.click(screen.getByTestId('avatar'));
      const menu = screen.getByTestId('menu');
      const logout = within(menu).getByRole('menuitem', { name: /logout/i });
      fireEvent.click(logout);

      expect(mockDisconnect).toHaveBeenCalled();
      expect(mockTrack.stop).toHaveBeenCalled();
      expect(mockSignOut).toHaveBeenCalled();
    });
  });

  describe('when there is not a user', () => {
    it('should render the "More" icon', () => {
      mockUseAppState.mockImplementation(() => ({ user: null, signOut: jest.fn() }));
      render(<Menu />);
      expect(screen.queryByTestId('more-icon')).toBeInTheDocument();
    });

    it('should not display the user name in the menu', () => {
      mockUseAppState.mockImplementation(() => ({
        user: { displayName: undefined },
        signOut: jest.fn(),
      }));
      render(<Menu />);
      fireEvent.click(screen.getByTestId('avatar'));
      const menu = screen.getByTestId('menu');
      expect(within(menu).queryByTestId('name-item')).not.toBeInTheDocument();
    });

    it('should not include the logout button in the menu', () => {
      mockUseAppState.mockImplementation(() => ({ user: null }));
      render(<Menu />);
      fireEvent.click(screen.getByTestId('more-icon'));
      const menu = screen.getByTestId('menu');
      expect(within(menu).queryByRole('menuitem', { name: /logout/i })).not.toBeInTheDocument();
    });
  });
});
