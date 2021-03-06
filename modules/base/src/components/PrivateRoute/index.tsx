import { useEffect } from 'react';
import { useRouter } from 'next/router';
import useGlobalState from '~/hooks/useGlobalState';

export default function PrivateRoute(props: {
  children: React.ReactChild;
}): React.ReactElement | null {
  const router = useRouter();
  const { isAuthReady, user } = useGlobalState();

  useEffect(() => {
    // don't prematurely push to login if auth is not ready
    // just hide component until we're sure
    if (!isAuthReady) {
      return;
    }

    if (!user) {
      router.push('/login');
    }
  }, [isAuthReady, user]); // eslint-disable-line

  return !!isAuthReady && !!user ? <>{props.children}</> : null;
}
