import React from 'react';
import { screen, render, waitFor, within } from '@testing-library/react';
import fireEvent from '@testing-library/user-event';
import { LocalModel, User } from 'shared/schema';
import MembersField from './MembersField';

const mockOnChange = jest.fn();

describe('the MembersField component', () => {
  it('should render correct values', () => {
    const values: LocalModel<User>[] = [
      { id: '1', displayName: 'hello world', email: '1' },
      { id: '2', displayName: 'steve appleseed', email: '2' },
    ];

    render(<MembersField users={values} onChange={mockOnChange} />);
    expect(screen.getAllByRole('textbox').map((e) => e.getAttribute('value'))).toEqual(
      expect.arrayContaining(['Hello (1)', 'Steve (2)']),
    );
  });

  it('should submit with the correct name', async () => {
    const values: LocalModel<User>[] = [
      { id: '1', displayName: 'test1', email: '1' },
      { id: '2', displayName: 'test2', email: '2' },
    ];

    render(<MembersField users={values} onChange={mockOnChange} />);

    fireEvent.type(screen.getByTestId('email-input'), 'hello3@world.com{enter}');

    expect(mockOnChange).toBeCalledTimes(1);
    expect(mockOnChange).toBeCalledWith(['hello3@world.com'], []);

    await waitFor(() => {
      fireEvent.click(screen.queryAllByTestId('remove-button')[2]);
    });
    expect(mockOnChange).toBeCalledWith([], []);
  });

  it('should allow users to remove emails', async () => {
    const values: LocalModel<User>[] = [{ id: '1', displayName: '', email: 'test@test.com' }];
    render(<MembersField users={values} onChange={mockOnChange} />);

    expect(screen.queryByTestId('email-item')).toBeInTheDocument();

    await waitFor(() => {
      fireEvent.click(screen.getByTestId('remove-button'));
    });

    expect(screen.queryByTestId('email-item')).not.toBeInTheDocument();
    expect(mockOnChange).toBeCalledTimes(1);
    expect(mockOnChange).toBeCalledWith([], [values[0]]);
  });

  describe('adding emails', () => {
    beforeEach(() => {
      const values: LocalModel<User>[] = [];
      render(<MembersField users={values} onChange={mockOnChange} />);
    });

    it('should allow users to add valid emails, and then clear inputs and refocuses', async () => {
      fireEvent.type(screen.getByTestId('email-input'), 'hello@world.com{enter}');

      expect(within(screen.getByTestId('email-item')).getByRole('textbox')).toHaveAttribute(
        'value',
        'hello@world.com',
      );

      const textbox = within(screen.getByTestId('email-input')).getByRole('textbox');

      await waitFor(() => expect(textbox).toHaveAttribute('value', ''));
      expect(textbox).toEqual(document.activeElement);
    });

    it('should not allow invalid emails', async () => {
      fireEvent.type(screen.getByTestId('email-input'), 'hello2@world{enter}');

      expect(screen.queryByTestId('email-item')).not.toBeInTheDocument();
      expect(screen.getByTestId('email-error').textContent).toMatch(/valid email/i);
    });

    it('should not allow duplicate emails', async () => {
      fireEvent.type(screen.getByTestId('email-input'), 'hello@world.com{enter}');

      // NOTE - this clear shouldn't actually be needed, since it should auto-clear after enter. But that doesn't seem to be working in test render (but it does work in actual browser).
      fireEvent.clear(within(screen.getByTestId('email-input')).getByRole('textbox'));
      fireEvent.type(screen.getByTestId('email-input'), 'hello@world.com{enter}');

      expect(screen.getByTestId('email-error').textContent).toMatch(/already been added/i);
      expect(screen.getAllByTestId('email-item').length).toEqual(1);
    });

    it('should trim any email inputs', async () => {
      fireEvent.type(screen.getByTestId('email-input'), '   hello@world.com {enter}');

      expect(within(screen.getByTestId('email-item')).getByRole('textbox')).toHaveAttribute(
        'value',
        'hello@world.com',
      );
    });
  });
});
