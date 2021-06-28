// database keys
export const CallsRTDBRoot = 'calls';

export const TasksDataKey = 'tasks';
export const ActionItemsKey = 'actionItems';
export const QuestionsKey = 'questions';
export const TakeAwaysKey = 'takeAways';

export const ChatsDataKey = 'chats';
// TODO: support other channels in the future (host only, private 1-1)
export const PublicChatsChannelKey = 'all';

export const ActivityDataKey = 'activityData';
export const CurrentActivityIDKey = 'currentActivityId';

export const ReactionsDataKey = 'reactions';
export const ReactionsCountDataKey = 'reactionCount';

// types that goes into rtdb
export type MessageTypes = 'text' | 'image' | 'file';
export interface MessageType {
  uid: string;
  type: MessageTypes;
  data: string; // raw text, image id, or file id
  createdAt: number; // need to be integer since rtdb don't support dates
}

export type ReactionTypes =
  | 'hello'
  | 'thumbsup'
  | 'happy'
  | 'laugh'
  | 'celebrate'
  | '100'
  | 'tear'
  | 'wow'
  | 'fire'
  | 'love';

export const ReactionMap: { [key in ReactionTypes]: string } = {
  hello: '👋',
  thumbsup: '👍',
  happy: '😀',
  laugh: '😂',
  celebrate: '🎉',
  100: '💯',
  tear: '😥',
  wow: '😲',
  fire: '🔥',
  love: '😍',
};

export interface ReactionType {
  uid: string;
  type: ReactionTypes;
  createdAt: number; // need to be integer since rtdb don't support dates
}

export interface TaskType {
  uid: string;
  isDone: boolean;
  name: string;
  order: number; // integer used for sorting
}

export interface TaskSectionType {
  [taskId: string]: TaskType;
}

export interface ChatChannelType {
  [messageId: string]: MessageType;
}

// data of a specific activity
export interface ActivityType {
  [key: string]: CallDataTypes;
}

// map of all activities by their activityIds
export interface ActivityDataType {
  [activityId: string]: ActivityType;
}

export type CallDataTypes = string | object | number | boolean | null;
export type CallDataKeys =
  | typeof ChatsDataKey
  | typeof ReactionsDataKey
  | typeof TasksDataKey
  | typeof ActivityDataKey;

export type CallData = {
  [key in CallDataKeys]?: CallDataTypes;
};
