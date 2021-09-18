import { CellType, Record } from './index';

// defines a JSON representation of the record schema that can be sent over the wire, without having do define the data for each individual cells

export interface CellData {
  id: number;
  data: CellType;
  createdAt: Date;
  modifiedAt: Date;
}

export interface RecordData extends Record {
  data: {
    [columnId: string]: CellData;
  };
}
