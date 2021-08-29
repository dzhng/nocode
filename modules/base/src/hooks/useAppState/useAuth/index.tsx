import { useEffect, useState, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { Collections, UserDetails } from 'shared/schema';
import supabase from '~/utils/supabase';

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

  const upsertDefaultUserDetailsRecord = useCallback(
    async (newUser: User, name?: string) => {
      const userData: UserDetails = {
        id: newUser.id,
        email: newUser.email,
        displayName: name,
        createdAt: new Date(),
      };

      const ret = await supabase.from<UserDetails>(Collections.USER_DETAILS).upsert(userData);
      if (ret.error) {
        console.error('Error upserting user record', ret.error);
        await signOut();
        return;
      }

      setUserDetails(userData);
    },
    [signOut],
  );

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
          if (!res.data) {
            // if data doesn't exist, upsert a new record
            await upsertDefaultUserDetailsRecord(user);
          } else {
            setUserDetails(res.data);
          }
        });
    }
  }, [user, upsertDefaultUserDetailsRecord]);

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

      const data = await supabase.auth.signUp({ email, password });
      if (data.error) {
        throw data.error;
      }

      if (data.user) {
        await upsertDefaultUserDetailsRecord(data.user, name);
      }

      setSession(data.session);
      setUser(data.user);
      return data.user;
    },
    [user, signOut, upsertDefaultUserDetailsRecord],
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
