// NOTE: make sure these types are aligned with firebase type checking rules in firestore.rules!

import firebase from '~/utils/firebase';

export enum Collections {
  USERS = 'users',
  TEMPLATES = 'templates',
  CALLS = 'calls',
  PRESENTATIONS = 'presentations',
  WORKSPACES = 'workspaces',
  MEMBERS = 'members', // this is a subcollection of workspaces
  INVITES = 'invites', // this is a subcollection of workspaces
}

export type FbDate = Date | firebase.firestore.Timestamp | firebase.firestore.FieldValue;

// extends the type with properties that is needed for client operations (such as id)
// becareful with this in components that deal with saving because it is very easy to get into a situation where you end up saving data that's extended for local, which would be rejected on server.
export type LocalModel<T> = T & { id: string };

export declare interface User {
  displayName: string;
  email?: string | null;
  photoURL?: string | null;
  bio?: string | null;
  defaultWorkspaceId?: string;
}

export declare interface Workspace {
  name: string;
  logoURL?: string | null;
  primaryColor?: string | null;
  backgroundColor?: string | null;
  isDeleted: boolean;
  createdAt: FbDate;
}

export type MemberRoles = 'owner' | 'member' | 'deleted';

export declare interface Member {
  memberId: string;
  role: MemberRoles;
  createdAt: FbDate;
}

export declare interface Invite {
  inviterId: string;
  email: string;
  createdAt: FbDate;
}

export type ActivityTypes = keyof ActivityMetadata;

export declare interface Activity {
  id: string;
  name: string;
  type: ActivityTypes;
  // metadata changes depending on activity types
  metadata: ActivityMetadata[ActivityTypes];
}

export declare interface Template {
  name: string;
  creatorId: string;
  workspaceId: string;
  ongoingCallId?: string | null;
  activities: Activity[];
  isDeleted: boolean;
  createdAt: FbDate;
}

export declare interface Call {
  templateId: string;
  creatorId: string;
  workspaceId: string;
  isFinished: boolean;
  duration?: number;
  activitiesSnapshot?: Activity[];
  createdAt: FbDate;
}

export declare interface Presentation {
  name: string;
  creatorId: string;
  workspaceId: string;
  slides: string[];
  isProcessed?: boolean;
  createdAt: FbDate;
}

// Activity type metadata schemas
export type ActivityMetadata = {
  presentation: PresentationActivityMetadata;
  video: VideoActivityMetadata;
  poll: PollActivityMetadata;
  questions: QuestionsActivityMetadata;
  breakout: BreakoutActivityMetadata;
};

export declare interface PresentationActivityMetadata {
  presentationId: string;
}

export declare interface VideoActivityMetadata {
  videoId: string;
}

export declare interface PollActivityMetadata {
  // if the voter can see current results right away,
  // or wait til poll closed
  showResultsRightAway: boolean;
  // if a user is allowed to vote once or multiple times
  isMultipleChoice: boolean;
  // how many times a user can vote if multiple choice is selected
  numberOfVotes: number;
  // list of options
  options: string[];
}

export declare interface QuestionsActivityMetadata {
  questions: string[];
  // allow participants to submit multiple answers
  allowMultipleSubmissions: boolean;
  // allow submissions to be anonymous
  allowAnonymousSubmissions: boolean;
}

export declare interface BreakoutActivityMetadata {
  numberOfRooms: number;
}
