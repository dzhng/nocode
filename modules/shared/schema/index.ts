// make sure this typescript schema aligns with schema.sql

export enum Collections {
  USER_DETAILS = 'users',
  WORKSPACES = 'workspaces',
  MEMBERS = 'members',
  INVITES = 'invites',
  APPS = 'apps',
  SHEETS = 'sheets',
  RECORDS = 'records',
}

/**
 * Admin schemas
 */

export declare interface UserDetails {
  id?: string;
  displayName?: string;
  email?: string | null;
  photoURL?: string | null;
  bio?: string | null;
  defaultWorkspaceId?: number;
  createdAt: Date;
}

export declare interface Workspace {
  id?: number;
  name: string;
  isDeleted: boolean;
  createdAt: Date;
}

export type MemberRoles = 'owner' | 'member' | 'deleted';

export declare interface Member {
  id?: number;
  workspaceId: number;
  userId: string;
  role: MemberRoles;
  createdAt: Date;
}

export declare interface Invite {
  id?: number;
  workspaceId: number;
  inviterId: string;
  email: string;
  createdAt: Date;
}

/**
 * Data schemas
 */

export declare interface App {
  id?: number;
  name: string;
  workspaceId: number;
  creatorId: string;
  isDeleted: boolean;
  createdAt: Date;
}

export declare interface Sheet {
  id?: number;
  appId: number;
  name: string;
  order: number;
  columns: ColumnType[];
  isDeleted: boolean;
  createdAt: Date;
}

export enum DataTypes {
  Text = 'text',
  Image = 'image',
  Number = 'number',
  File = 'file',
  Date = 'date',
  Location = 'location',

  // select from a list of predefined text or numbers
  SingleSelection = 'single_selection',
  MultipleSelection = 'multiple_selection',

  // can be text, image, number, file, date, or location
  List = 'list',

  // map to value from another table, based on a value from this row
  RelationOne = 'relation_one',
  RelationMany = 'relation_many',
}

/**
 * Column definitions
 */

export interface SelectionMeta {
  type: DataTypes.Text | DataTypes.Number;
  // all potiential options that can be selected
  options: string[] | number[];
}

export interface ListMeta {
  // the type of data that is stored in the list
  type: DataTypes;
}

export interface RelationMeta {
  // the column in the current table that serves as the key
  keyColumnId: string;

  // point to the location of the relational data value
  valueTableId: string;
  valueColumnId: string;
}

export interface TableMeta {
  width?: number;
  isHidden?: boolean;
}

export interface ColumnType {
  id?: number;
  name: string;
  type: DataTypes;
  defaultValue?: CellType;
  typeMetadata?: SelectionMeta | ListMeta | RelationMeta;
  tableMetadata?: TableMeta;
}

/**
 * Row and Cell definitions
 */

export interface Record {
  id?: number;
  sheetId: number;
  order: number;
  createdAt: Date;
  modifiedAt: Date;
}

export type CellType = string | number | Date | object | string[] | number[];

// all cell data can be stored eitehr as string, number, or json. string and numbers are explicitly exposed so that postgres can index
export interface Cell {
  id?: number;
  recordId: number;
  columnId: number;
  dataString?: string;
  dataNumber?: number;
  dataJSON?: object | string[] | number[];
  createdAt: Date;
  modifiedAt: Date;
}
