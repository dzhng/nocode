import React from 'react';
import AboutDialog from './AboutDialog';
import { screen, render } from '@testing-library/react';

jest.mock('twilio-video', () => ({ version: '1.2', isSupported: true }));

describe('the AboutDialog component', () => {
  it('should display Video.isSupported', () => {
    render(<AboutDialog open={true} onClose={() => {}} />);
    expect(screen.getByText('Browser supported: true')).toBeInTheDocument();
  });

  it('should display the SDK version', () => {
    render(<AboutDialog open={true} onClose={() => {}} />);
    expect(screen.getByText('SDK Version: 1.2')).toBeInTheDocument();
  });
});
