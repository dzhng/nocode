import * as admin from 'firebase-admin';

const firebaseCert = process.env.FIREBASE_SERVICE_ACCOUNT_CREDENTIALS ?? '';
const databaseURL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ?? '';

const parsedCert = JSON.parse(Buffer.from(firebaseCert, 'base64').toString());
const credential = admin.credential.cert(parsedCert);

if (!admin.apps?.length) {
  admin.initializeApp({ credential, databaseURL });
}

export default admin;
