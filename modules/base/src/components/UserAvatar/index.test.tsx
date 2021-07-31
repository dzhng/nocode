import React from 'react';
import { screen, render, within } from '@testing-library/react';
import UserAvatar, { getInitials } from './UserAvatar';

describe('the UserAvatar component', () => {
  it('should display the users initials when there is a displayName property', () => {
    render(<UserAvatar data-testid="avatar" user={{ displayName: 'Test User' } as any} />);
    expect(screen.getByTestId('avatar').textContent).toBe('TU');
  });

  it('should display the Person icon when there is no displayName or photoURL properties', () => {
    render(<UserAvatar user={{} as any} />);
    expect(screen.getByTestId('person-icon')).toBeInTheDocument();
  });

  it('should display the users photo when the photoURL property exists', () => {
    render(<UserAvatar data-testid="avatar" user={{ photoURL: 'testURL' } as any} />);
    expect(within(screen.getByTestId('avatar')).getByRole('img')).toHaveAttribute('src', 'testURL');
  });

  describe('getInitials function', () => {
    it('should generate initials from a name', () => {
      expect(getInitials('test')).toBe('T');
      expect(getInitials('Test User')).toBe('TU');
      expect(getInitials('test User TWO')).toBe('TUT');
    });
  });
});
