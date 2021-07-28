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
  keyColumnID: string;

  // point to the location of the relational data value
  valueTableID: string;
  valueColumnID: string;
}

export interface TableMeta {
  width?: number;
  isHidden?: boolean;
}

export interface ColumnType {
  columnID: string;
  name: string;
  type: DataTypes;
  defaultValue?: CellType;
  typeMetadata?: SelectionMeta | ListMeta | RelationMeta;
  tableMetadata?: TableMeta;
}

export type CellType = string | number | Date | object | string[] | number[];

// each row is a record, hence the _id is required to track recordID
export interface RowType {
  _id: string;
  [columnID: string]: CellType | undefined;
}
