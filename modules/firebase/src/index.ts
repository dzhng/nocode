import * as functions from 'firebase-functions';
import 'firebase-functions';

export const helloWorld = functions.https.onRequest(async (_, res) => {
  res.send('<p>hello world!</p>');
});
