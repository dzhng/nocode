import { useEffect, useState, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { Collections, UserDetails } from 'shared/schema';
import fetch from 'isomorphic-unfetch';
import supabase from '~/utils/supabase';

const REGISTER_ENDPOINT = '/api/registerUser';

export default function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setIsAuthReady(false);
    setUserDetails(null);
    setSession(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const currentSession = supabase.auth.session();
    if (currentSession === null) {
      setIsAuthReady(true);
    } else {
      setSession(currentSession);
      if (currentSession.user) {
        setUser(currentSession.user);
        setIsAuthReady(true);
      }
    }

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_, newSession) => {
      if (newSession && newSession.user) {
        console.log('Auth state changed: update');
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setIsAuthReady(true);
      } else {
        console.log('Auth state changed: sign out');
        setIsAuthReady(false);
        setSession(null);
        setUserDetails(null);
        setUser(null);
      }
    });

    return () => {
      authListener?.unsubscribe();
    };
  }, [signOut]);

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
      setSession(data.session);
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
    session,
    signInWithEmailAndPassword,
    signInWithGoogle,
    signOut,
    isAuthReady,
    register,
  };
}
