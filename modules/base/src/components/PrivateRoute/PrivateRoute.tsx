import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAppState } from '~/hooks/useAppState';

export default function PrivateRoute(props: {
  children: React.ReactChild;
}): React.ReactElement | null {
  const router = useRouter();
  const { isAuthReady, user } = useAppState();

  const isAuthenticated: boolean = !!isAuthReady && !!user;

  useEffect(() => {
    // don't prematurely push to login if auth is not ready
    // just hide component until we're sure
    if (!isAuthReady) {
      return;
    }

    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthReady]); // eslint-disable-line

  return isAuthenticated ? <>{props.children}</> : null;
}
