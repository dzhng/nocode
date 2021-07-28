//import React from 'react';
import { useRouter } from 'next/router';

import { useAppState } from '~/state';
//import IndexPage from '~/pages/index';

jest.mock('next/router');
jest.mock('~/hooks/Video/useRoomState/useRoomState');
jest.mock('~/hooks/Video/useVideoContext/useVideoContext');
jest.mock('~/state');

const mockUseRouter = useRouter as jest.Mock<any>;
const mockUseAppState = useAppState as jest.Mock<any>;
const mockPush = jest.fn();

describe.skip('Home container', () => {
  beforeEach(() => {
    mockUseAppState.mockImplementation(() => ({ isAuthReady: true, user: {} }));
    mockUseRouter.mockImplementation(() => ({ push: mockPush }));
  });

  it('should display list of upcoming calls', () => {});

  it('should display list of customers', () => {});
});
