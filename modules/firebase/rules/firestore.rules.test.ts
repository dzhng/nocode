/**
 * @jest-environment node
 */

import * as firebase from '@firebase/rules-unit-testing';
import path from 'path';
import fs from 'fs';

console.log(`EMULATOR HOST: ${process.env.FIRESTORE_EMULATOR_HOST}`);

/**
 * The emulator will accept any project ID for testing.
 */
const PROJECT_ID = 'firestore-emulator-test';

/**
 * Creates a new client FirebaseApp with authentication and returns the Firestore instance.
 */
function getAuthedFirestore(auth: { uid: string } | null) {
  return firebase.initializeTestApp({ projectId: PROJECT_ID, auth: auth ?? undefined }).firestore();
}

function getAdminFirestore() {
  return firebase.initializeAdminApp({ projectId: PROJECT_ID }).firestore();
}

describe('firebase cloud firestore database rules', () => {
  beforeAll(async () => {
    // Load the rules file before the tests begin
    const rules = fs.readFileSync(path.resolve(__dirname, './firestore.rules'), 'utf8');
    await firebase.loadFirestoreRules({ projectId: PROJECT_ID, rules });
  });

  afterAll(async () => {
    // Delete all the FirebaseApp instances created during testing
    // Note: this does not affect or clear any data
    await Promise.all(firebase.apps().map((app) => app.delete()));
  });

  beforeEach(async () => {
    // Clear the database between tests
    await firebase.clearFirestoreData({ projectId: PROJECT_ID });

    const admin = getAdminFirestore();

    // create a workspace
    const workspace = admin.collection('workspaces').doc('workspace');
    await workspace.set({ createdAt: new Date(), name: 'My Workspace', isDeleted: false });

    // Create an owner user
    await admin.collection('users').doc('OwnerUser').set({
      displayName: 'owner',
    });

    const member = admin
      .collection('workspaces')
      .doc('workspace')
      .collection('members')
      .doc('OwnerUser');
    await member.set({
      role: 'owner',
      memberId: 'OwnerUser',
      createdAt: new Date(),
    });

    // create a few sample user accounts first so it can be updated later
    await admin.collection('users').doc('charlie').set({
      displayName: 'charlie',
      email: 'charlie@test.com',
      bio: 'hello',
    });
    await admin.collection('users').doc('alice').set({
      displayName: 'alice',
      email: 'alice@test.com',
      bio: 'hello',
    });
  });

  describe('workspace', () => {
    const requiredFields = {
      name: 'workspace',
      isDeleted: false,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    };

    it('allows anyone to read workspace data', async () => {
      const db = getAuthedFirestore(null);
      const workspace = db.collection('workspaces').doc('workspace');
      const doc = await firebase.assertSucceeds(workspace.get());
      expect(doc.data().name).toEqual('My Workspace');
    });

    it('require users to log in and be owner before updating workspace', async () => {
      const db = getAuthedFirestore(null);
      const workspace = db.collection('workspaces').doc('workspace');
      await firebase.assertFails(workspace.set(requiredFields));
    });

    it('does not allow a user to create a new workspace without admin', async () => {
      const db = getAuthedFirestore({ uid: 'OwnerUser' });
      const workspace = db.collection('workspaces').doc('test');
      await firebase.assertFails(workspace.set(requiredFields));

      // try batching creating workspace and user, but not admin
      const batch = db.batch();
      const workspaceRef = db.collection('workspaces').doc();
      batch.set(workspaceRef, requiredFields);

      const adminRef = workspaceRef.collection('members').doc('OwnerUser');
      batch.set(adminRef, {
        role: 'member',
        memberId: 'OwnerUser',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      await firebase.assertFails(batch.commit());
    });

    it('allows a new user to create a new workspace via batch with user as owner', async () => {
      const db = getAuthedFirestore({ uid: 'OwnerUser' });
      const batch = db.batch();

      const workspaceRef = db.collection('workspaces').doc();
      batch.set(workspaceRef, requiredFields);

      const adminRef = workspaceRef.collection('members').doc('OwnerUser');
      batch.set(adminRef, {
        role: 'owner',
        memberId: 'OwnerUser',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });

      await firebase.assertSucceeds(batch.commit());
    });

    it('allows an existing user to create a new workspace with himself as admin', async () => {
      const db = getAuthedFirestore({ uid: 'alice' });
      const batch = db.batch();

      const workspaceRef = db.collection('workspaces').doc();
      batch.set(workspaceRef, requiredFields);

      const userRef = db.collection('users').doc('alice');
      batch.update(userRef, {
        defaultWorkspaceId: workspaceRef.id,
      });

      const adminRef = workspaceRef.collection('members').doc('alice');
      batch.set(adminRef, {
        role: 'owner',
        memberId: 'alice',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });

      await firebase.assertSucceeds(batch.commit());
    });

    it('allows logged in owners to update workspace', async () => {
      const db = getAuthedFirestore({ uid: 'OwnerUser' });
      const workspace = db.collection('workspaces').doc('workspace');
      await firebase.assertSucceeds(workspace.update({ name: 'hello world' }));
    });

    it('does not allow random data to be added to workspace', async () => {
      const db = getAuthedFirestore({ uid: 'OwnerUser' });
      const workspace = db.collection('workspaces').doc('workspace');
      await firebase.assertFails(workspace.update({ name: 'hello world', random: 'data' }));
    });

    it('does not allow memberId to deviate', async () => {
      const db = getAuthedFirestore({ uid: 'OwnerUser' });
      await firebase.assertFails(
        db.collection('workspaces').doc('workspace').collection('members').doc('charlie').set({
          role: 'member',
          memberId: 'bob',
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        }),
      );

      await firebase.assertSucceeds(
        db.collection('workspaces').doc('workspace').collection('members').doc('charlie').set({
          role: 'member',
          memberId: 'charlie',
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        }),
      );
    });

    it('allows logged in users to query for their workspaces based on members', async () => {
      const db = getAuthedFirestore({ uid: 'OwnerUser' });

      await firebase.assertSucceeds(
        db.collectionGroup('members').where('memberId', '==', 'OwnerUser').get(),
      );

      await firebase.assertFails(
        db.collectionGroup('members').where('memberId', '==', 'alice').get(),
      );
    });

    it('allows logged in users to query for members in a workspace', async () => {
      const db = getAuthedFirestore({ uid: 'OwnerUser' });

      await firebase.assertSucceeds(
        db.collection('workspaces').doc('workspace').collection('members').get(),
      );
    });

    it('allows members to change role to deleted', async () => {
      const db = getAuthedFirestore({ uid: 'OwnerUser' });

      await firebase.assertSucceeds(
        db.collection('workspaces').doc('workspace').collection('members').doc('OwnerUser').update({
          role: 'deleted',
        }),
      );
    });

    it('does not allow workspaces to be deleted', async () => {
      const db = getAuthedFirestore({ uid: 'OwnerUser' });

      await firebase.assertFails(db.collection('workspaces').doc('workspace').delete());
    });

    it('allows members to invite other users via email', async () => {
      const db = getAuthedFirestore({ uid: 'OwnerUser' });
      const inviteData = {
        inviterId: 'OwnerUser',
        email: 'hello@test.com',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      };

      await firebase.assertSucceeds(
        db.collection('workspaces').doc('workspace').collection('invites').add(inviteData),
      );
    });
  });

  describe('user', () => {
    it('only allow user to update their own profile', async () => {
      const db = getAuthedFirestore({ uid: 'alice' });
      const charlie = db.collection('users').doc('charlie');
      await firebase.assertFails(
        charlie.update({
          bio: 'hello world',
        }),
      );

      const alice = db.collection('users').doc('alice');
      await firebase.assertSucceeds(
        alice.update({
          bio: 'hello world',
        }),
      );
    });

    it('should enforce user profiles fields', async () => {
      const db = getAuthedFirestore({ uid: 'alice' });
      const profile = db.collection('users').doc('alice');
      await firebase.assertFails(
        profile.update({
          birthday: 'January 1',
        }),
      );
      await firebase.assertSucceeds(
        profile.update({
          bio: 'hello world',
        }),
      );
    });

    it('should not let users create profile', async () => {
      const db = getAuthedFirestore({ uid: 'alice' });
      await firebase.assertFails(
        db.collection('users').doc('bob').set({
          displayName: 'alice',
          bio: 'hello world',
        }),
      );
    });

    it('should let anyone read any profile', async () => {
      const db = getAuthedFirestore(null);
      const profile = db.collection('users').doc('alice');
      await firebase.assertSucceeds(profile.get());
    });
  });

  describe('template', () => {
    let requiredFields = {
      name: 'Test template',
      creatorId: 'alice',
      workspaceId: 'workspace',
      activities: ['hello'],
      isDeleted: false,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    };

    it('should let logged in users create a template', async () => {
      const db = getAuthedFirestore({ uid: 'alice' });
      const template = db.collection('templates').doc('doc');
      await firebase.assertSucceeds(
        template.set({
          ...requiredFields,
        }),
      );
    });

    it('should only allow the correct state', async () => {
      const db = getAuthedFirestore({ uid: 'alice' });
      const template = db.collection('templates').doc('doc');
      // need at least a non-empty name
      await firebase.assertFails(
        template.set({
          ...requiredFields,
          name: '',
        }),
      );

      // empty activities
      await firebase.assertFails(
        template.set({
          ...requiredFields,
          activities: [null, 'alice', 'charlie'],
        }),
      );
    });

    it('should let anyone access a template', async () => {
      const db = getAuthedFirestore(null);
      const template = db.collection('templates').doc('doc');
      await firebase.assertSucceeds(template.get());
    });

    it('should let anyone query for templates created by them', async () => {
      const db = getAuthedFirestore({ uid: 'alice' });
      const templates = db.collection('templates').where('creatorId', '==', 'alice');
      await firebase.assertSucceeds(templates.get());
    });

    it('should force the creator of the template to have the correct creatorId', async () => {
      const db = getAuthedFirestore({ uid: 'alice' });
      const template = db.collection('templates').doc('doc');
      await firebase.assertFails(
        template.set({
          ...requiredFields,
          creatorId: 'charlie',
        }),
      );
    });

    it('should let workspace members update the template', async () => {
      let db = getAuthedFirestore({ uid: 'alice' });
      let template = db.collection('templates').doc('doc');
      await template.set({
        ...requiredFields,
        ongoingCallId: 'yo',
        activities: ['hello', 'world'],
      });

      // unsetting a activity
      await firebase.assertFails(
        template.update({
          activities: ['hello'],
        }),
      );

      db = getAuthedFirestore({ uid: 'OwnerUser' });
      template = db.collection('templates').doc('doc');

      await firebase.assertSucceeds(
        template.update({
          activities: ['hello'],
        }),
      );

      // unsetting activityId
      await firebase.assertSucceeds(
        template.update({
          ongoingCallId: null,
        }),
      );
    });
  });

  describe('call', () => {
    let requiredFields = {
      templateId: '123',
      creatorId: 'alice',
      workspaceId: 'workspace',
      isFinished: false,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    };

    it('should let logged in users create a call', async () => {
      const db = getAuthedFirestore({ uid: 'alice' });
      const call = db.collection('calls').doc('doc');
      await firebase.assertSucceeds(
        call.set({
          ...requiredFields,
        }),
      );
    });
  });

  describe('presentation', () => {
    const requiredFields = {
      name: 'hello',
      creatorId: 'alice',
      workspaceId: 'workspace',
      slides: ['yo'],
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    };

    it('should let logged in userse create a presentation and enforce creatorId', async () => {
      const db = getAuthedFirestore({ uid: 'alice' });
      const presentation = db.collection('presentations').doc('p');
      await firebase.assertSucceeds(presentation.set(requiredFields));

      // should be update now since record already created
      await firebase.assertSucceeds(
        presentation.update({
          name: 'hello world',
        }),
      );
    });

    it('should enforce the correct creatorId value', async () => {
      const db = getAuthedFirestore({ uid: 'alice' });
      const presentation = db.collection('presentations').doc('p');
      await firebase.assertFails(
        presentation.set({
          ...requiredFields,
          creatorId: 'bob',
        }),
      );
    });

    it('should not let other users update the presentation', async () => {
      const db = getAuthedFirestore({ uid: 'alice' });
      const presentation = db.collection('presentations').doc('p');
      await presentation.set(requiredFields);

      const bob = getAuthedFirestore({ uid: 'bob' });
      const bobPresentation = bob.collection('presentations').doc('p');
      await firebase.assertFails(
        bobPresentation.set({
          name: 'hello world',
        }),
      );
    });
  });
});
