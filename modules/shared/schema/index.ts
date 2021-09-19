// make sure this typescript schema aligns with schema.sql
import { z } from 'zod';

export enum Collections {
  USER_DETAILS = 'users',
  WORKSPACES = 'workspaces',
  MEMBERS = 'members',
  INVITES = 'invites',
  APPS = 'apps',
  SHEETS = 'sheets',
  RECORDS = 'records',
  CELLS = 'cells',
  CELL_CHANGE = 'cellchange',
}

/**
 * Admin schemas
 */

export const UserDetailsSchema = z.object({
  id: z.string().uuid().optional(),
  displayName: z.string().nullish(),
  email: z.string().nullish(),
  photoURL: z.string().nullish(),
  bio: z.string().nullish(),
  defaultWorkspaceId: z.number().nullish(),
  createdAt: z.date(),
});
export type UserDetails = z.infer<typeof UserDetailsSchema>;

export const WorkspaceSchema = z.object({
  id: z.number().optional(),
  name: z.string(),
  isDeleted: z.boolean(),
  createdAt: z.date(),
});
export type Workspace = z.infer<typeof WorkspaceSchema>;

export const MemberRolesSchema = z.enum(['owner', 'member', 'deleted']);
export type MemberRoles = z.infer<typeof MemberRolesSchema>;

export const MemberSchema = z.object({
  id: z.number().optional(),
  workspaceId: z.number(),
  userId: z.string().uuid(),
  role: MemberRolesSchema,
  createdAt: z.date(),
});
export type Member = z.infer<typeof MemberSchema>;

export const InviteSchema = z.object({
  id: z.number().optional(),
  workspaceId: z.number(),
  inviterId: z.string().uuid(),
  email: z.string().email(),
  createdAt: z.date(),
});
export type Invite = z.infer<typeof InviteSchema>;

/**
 * Data schemas
 */

export const AppSchema = z.object({
  id: z.number().optional(),
  name: z.string(),
  workspaceId: z.number(),
  creatorId: z.string().uuid(),
  isDeleted: z.boolean(),
  createdAt: z.date(),
});
export type App = z.infer<typeof AppSchema>;

export enum DataTypes {
  Text = 'text',
  Image = 'image',
  Number = 'number',
  File = 'file',
  Date = 'date',
  Location = 'location',

  // select from a list of predefined text or numbers
  Selection = 'selection',

  // map to value from another table, based on a value from this row
  Relation = 'relation',
}
export const DataTypesSchema = z.nativeEnum(DataTypes);

/**
 * Cell Data Definitions
 */
export const CellTypeSchema = z
  .string()
  .or(z.number())
  .or(z.date())
  .or(z.object({})) // make sure to parse with .passthrough() if this is used
  .or(z.string().array())
  .or(z.number().array());
export type CellType = z.infer<typeof CellTypeSchema>;

/**
 * Column definitions
 */

export const SelectionMetaSchema = z.object({
  type: z.enum([DataTypes.Text, DataTypes.Number]),
  options: z.array(z.string()).or(z.array(z.number())),
});
export type SelectionMeta = z.infer<typeof SelectionMetaSchema>;

export const RelationMetaSchema = z.object({
  // the column in the current table that serves as the key
  keyColumnId: z.string(),

  // point to the location of the relational data value
  valueSheetId: z.string(),
  valueColumnId: z.string(),
});
export type RelationMeta = z.infer<typeof RelationMetaSchema>;

export const TableMetaSchema = z.object({
  width: z.number().optional(),
  isHidden: z.boolean().optional(),
});
export type TableMeta = z.infer<typeof TableMetaSchema>;

export const ColumnTypeSchema = z.object({
  id: z.number().optional(),
  name: z.string(),
  type: DataTypesSchema,
  defaultValue: CellTypeSchema.optional(),
  typeMetadata: SelectionMetaSchema.or(RelationMetaSchema).optional(),
  tableMetadata: TableMetaSchema.optional(),
});
export type ColumnType = z.infer<typeof ColumnTypeSchema>;

/**
 * Row and Cell definitions
 */

export const RecordSchema = z.object({
  id: z.number().optional(),
  sheetId: z.number(),
  order: z.number(),
  createdAt: z.date(),
});
export type Record = z.infer<typeof RecordSchema>;

// all cell data can be stored either as string, number, or json. string and numbers are explicitly exposed so that postgres can index
export const CellSchema = z.object({
  id: z.number().optional(),
  recordId: z.number(),
  columnId: z.number(),
  dataString: z.string().optional(),
  dataNumber: z.number().optional(),
  dataJSON: CellTypeSchema.optional(),
  createdAt: z.date(),
  modifiedAt: z.date(),
});
export type Cell = z.infer<typeof CellSchema>;

export const SheetSchema = z.object({
  id: z.number().optional(),
  appId: z.number(),
  name: z.string(),
  order: z.number(),
  columns: ColumnTypeSchema.array(),
  isDeleted: z.boolean(),
  createdAt: z.date(),
});
export type Sheet = z.infer<typeof SheetSchema>;

/**
 * Track app / sheet / record / cell change timestamps
 */
export const CellChangeSchema = z.object({
  id: z.number().optional(),
  appId: z.number(),
  sheetId: z.number(),
  recordId: z.number(),
  cellId: z.number(),
  modifiedAt: z.date(),
});
export type CellChange = z.infer<typeof CellChangeSchema>;
