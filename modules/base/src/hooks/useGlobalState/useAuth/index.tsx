import { useEffect, useState, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { Collections, UserDetails } from 'shared/schema';
import fetch from 'isomorphic-unfetch';
import supabase from '~/utils/supabase';

const REGISTER_ENDPOINT = '/api/registerUser';
const AUTH_ENDPOINT = '/api/auth';

export default function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const currentUser = supabase.auth.user();
    if (currentUser === null) {
      setIsAuthReady(true);
    } else {
      setUser(currentUser);
      setIsAuthReady(true);
    }

    // fetch auth cookies on startup if already logged in
    const currentSession = supabase.auth.session();
    if (currentSession) {
      fetch(AUTH_ENDPOINT, {
        method: 'POST',
        headers: new Headers({ 'Content-Type': 'application/json' }),
        credentials: 'same-origin',
        body: JSON.stringify({ event: 'SIGNED_IN', session: currentSession }),
      });
    }

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (newSession && newSession.user) {
        console.log('Auth state changed: update');
        setUser(newSession?.user ?? null);
        setIsAuthReady(true);
      } else {
        console.log('Auth state changed: sign out');
        setIsAuthReady(false);
        setUserDetails(null);
        setUser(null);
      }

      // call auth endpoint to set cookies on any auth state changes
      fetch(AUTH_ENDPOINT, {
        method: 'POST',
        headers: new Headers({ 'Content-Type': 'application/json' }),
        credentials: 'same-origin',
        body: JSON.stringify({ event, session: newSession }),
      });
    });

    return () => {
      authListener?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user) {
      supabase
        .from<UserDetails>(Collections.USER_DETAILS)
        .select('*')
        .eq('id', user.id)
        .single()
        .then(async (res) => {
          if (res.data) {
            setUserDetails(res.data);
          }
        });
    }
  }, [user]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setIsAuthReady(false);
    setUserDetails(null);
    setUser(null);
  }, []);

  const signInWithEmailAndPassword = useCallback(
    async (email, password) => {
      // if already signed in, sign out first
      if (user) {
        await signOut();
      }

      const data = await supabase.auth.signIn({ email, password });
      if (data.error) {
        throw data.error;
      }

      setUser(data.user);
      return data.user;
    },
    [user, signOut],
  );

  const signInWithGoogle = useCallback(async () => {
    // if already signed in, sign out first
    if (user) {
      await signOut();
    }
    // TODO
    return null;
  }, [user, signOut]);

  const register = useCallback(
    async (email: string, password: string, name: string) => {
      if (user) {
        await signOut();
      }

      const params = JSON.stringify({
        email,
        password,
        name,
      });

      const res = await fetch(REGISTER_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: params,
      });

      if (!res.ok) {
        throw new Error('Cannot register for user');
      }
    },
    [user, signOut],
  );

  return {
    user,
    userDetails,
    signInWithEmailAndPassword,
    signInWithGoogle,
    signOut,
    isAuthReady,
    register,
  };
}
