import { useCallback, useEffect, useState } from 'react';
import { Collections, User } from 'shared/schema';
import firebase, { db, auth } from '~/utils/firebase';

export default function useFirebaseAuth() {
  const [user, setUser] = useState<firebase.User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((newUser) => {
      setUser(newUser);
      setIsAuthReady(true);
    });

    return unsubscribe;
  }, []);

  const signInWithEmailAndPassword = useCallback(
    async (email, password) => {
      // if already signed in, sign out first
      if (user) {
        await auth.signOut();
        setUser(null);
      }

      const ret = await auth.signInWithEmailAndPassword(email, password);
      setUser(ret.user);
      return ret.user;
    },
    [user],
  );

  const signInWithGoogle = useCallback(async () => {
    // if already signed in, sign out first
    if (user) {
      await auth.signOut();
      setUser(null);
    }

    const provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');

    const ret = await auth.signInWithPopup(provider);
    setUser(ret.user);
    return ret.user;
  }, [user]);

  const signInAnonymously = useCallback(async (displayName: string) => {
    const ret = await auth.signInAnonymously();

    if (ret.user) {
      // pre create the user data to set displayName, make sure to merge
      // for anonymous users, it's up to the client to create the User record,
      // cloud functions won't process.
      const userData: User = {
        displayName,
      };
      db.collection(Collections.USERS).doc(ret.user.uid).set(userData);
    }

    setUser(ret.user);
    return ret.user;
  }, []);

  const signOut = useCallback(async () => {
    await auth.signOut();
    setUser(null);
  }, []);

  const register = useCallback(
    async (email: string, password: string, name: string) => {
      if (user) {
        await auth.signOut();
        setUser(null);
      }

      const data = await auth.createUserWithEmailAndPassword(email, password);

      // This part is a bit hacky, we basically want to update the display name
      // once the user record has been created by the cloud function. Yes we can
      // make the cloud function smarter by having it check user data, but I prefer
      // to keep complexity on client where it's easier to test / deploy.
      if (data.user) {
        const userData: User = {
          displayName: name ?? 'Aomni Customer',
        };

        let unsubscribe = db
          .collection(Collections.USERS)
          .doc(data.user.uid)
          .onSnapshot(async (snap) => {
            if (snap.exists) {
              await snap.ref.update(userData);
              unsubscribe();
            }
          });
      }

      setUser(data.user);
      return data.user;
    },
    [user],
  );

  return {
    user,
    signInWithEmailAndPassword,
    signInWithGoogle,
    signInAnonymously,
    signOut,
    isAuthReady,
    register,
  };
}
