import React from 'react';
import { screen, render } from '@testing-library/react';
import fireEvent from '@testing-library/user-event';
import { TwilioError } from 'twilio-video';
import ErrorDialog from './ErrorDialog';

describe('the ErrorDialog component', () => {
  const message = 'Fake Error message';
  const code = 45345;

  it('should be closed if no error is passed', () => {
    render(<ErrorDialog dismissError={() => {}} error={null} />);
    expect(screen.queryByRole('presentation')).not.toBeInTheDocument();
  });

  it('should be open if an error is passed', () => {
    const error = {} as TwilioError;
    render(<ErrorDialog dismissError={() => {}} error={error} />);
    expect(screen.queryByRole('presentation')).toBeInTheDocument();
  });

  it('should display error message but not error code is the later does not exist', () => {
    const error = { message } as TwilioError;
    render(<ErrorDialog dismissError={() => {}} error={error} />);
    expect(screen.getByTestId('content-text').textContent).toBe(message);
    expect(screen.queryByTestId('code')).not.toBeInTheDocument();
  });

  it('should display error message and error code when both are given', () => {
    const error = { message, code } as TwilioError;
    render(<ErrorDialog dismissError={() => {}} error={error} />);
    expect(screen.getByTestId('content-text').textContent).toBe(message);
    expect(screen.queryByTestId('code')).toBeInTheDocument();
    expect(screen.getByTestId('code').textContent).toBe(`Error Code: ${code}`);
  });

  it('should display an enhanced error message when error code is 20101', () => {
    const error = { message, code: 20101 } as TwilioError;
    render(<ErrorDialog dismissError={() => {}} error={error} />);
    expect(screen.getByTestId('content-text').textContent).toBe(
      message + '. Please make sure you are using the correct credentials.',
    );
    expect(screen.getByTestId('code').textContent).toBe(`Error Code: ${20101}`);
  });

  it('should invoke dismissError prop when the user clicks on OK button', () => {
    const error = { message, code } as TwilioError;
    const dismissError = jest.fn();
    render(<ErrorDialog dismissError={dismissError} error={error} />);
    fireEvent.click(screen.getByRole('button'));
    expect(dismissError).toHaveBeenCalled();
  });
});
