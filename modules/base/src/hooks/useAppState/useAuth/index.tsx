import { useEffect, useState, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { Collections, UserDetails } from 'shared/schema';
import supabase from '~/utils/supabase';

export default function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const upsertDefaultUserDetailsRecord = async (newUser: User, name?: string) => {
    const userData: UserDetails = {
      id: newUser.id,
      email: newUser.email,
      displayName: name,
      createdAt: new Date(),
    };

    const ret = await supabase.from<UserDetails>(Collections.USER_DETAILS).upsert(userData);
    if (ret.error) {
      console.error('Error upserting user record', ret.error);
    }

    setUserDetails(userData);
  };

  useEffect(() => {
    const currentSession = supabase.auth.session();
    setSession(currentSession);
    setUser(currentSession?.user ?? null);

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
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
          if (!res.data) {
            // if data doesn't exist, upsert a new record
            await upsertDefaultUserDetailsRecord(user);
            setIsAuthReady(true);
          } else {
            setUserDetails(res.data);
            setIsAuthReady(true);
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
  }, [user, signOut]);

  const register = useCallback(
    async (email: string, password: string, name: string) => {
      if (user) {
        await signOut();
      }

      const data = await supabase.auth.signUp({ email, password });

      if (data.user) {
        await upsertDefaultUserDetailsRecord(data.user, name);
      }

      setSession(data.session);
      setUser(data.user);
      return data.user;
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
