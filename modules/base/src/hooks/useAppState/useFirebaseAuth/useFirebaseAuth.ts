import { useCallback, useEffect, useState } from 'react';
import fetch from 'isomorphic-unfetch';
import firebase, { db, auth } from '~/utils/firebase';
import { Collections, User } from '~/firebase/schema-types';
import { TWILIO_TOKEN_ENDPOINT } from '~/constants';

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

  // fetch twilio token for call from internal endpoint (which talks to twilio admin API)
  // TODO: move this to another file that's not firebase related
  const getToken = useCallback(
    async (roomName: string): Promise<string> => {
      if (!user) {
        return Promise.reject('User is not authenticated');
      }

      const idToken = await user.getIdToken();
      const params = JSON.stringify({ idToken, roomName });

      const res = await fetch(`${TWILIO_TOKEN_ENDPOINT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: params,
      });

      return res.text();
    },
    [user],
  );

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
    getToken,
    register,
  };
}
