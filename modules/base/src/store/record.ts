import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { forEach, without } from 'lodash';
import { Record } from 'shared/schema';

export interface State {
  // key is sheetId, value is array of sorted reocrdIds
  recordsBySheet: { [sheetId: number]: number[] };
  records: { [recordId: number]: Record };
}

const initialState: State = {
  recordsBySheet: {},
  records: {},
};

export default createSlice({
  name: 'record',
  initialState,
  reducers: {
    setRecordsForSheet: (state, action: PayloadAction<{ sheetId: number; records: Record[] }>) => {
      const sorted = action.payload.records.sort((a, b) => a.order - b.order);
      const ids = sorted.map((record) => Number(record.id));

      state.recordsBySheet[action.payload.sheetId] = ids;

      // first, scan through all records and delete the ones with same sheetId, since we are going to override all records with the new records
      forEach(state.records, (value, key) => {
        if (value.sheetId === action.payload.sheetId) {
          delete state.records[Number(key)];
        }
      });

      // next, insert new records
      sorted.forEach((record) => {
        state.records[Number(record.id)] = record;
      });
    },
    createRecord: (state, action: PayloadAction<{ record: Record; index: number }>) => {
      const { id, sheetId } = action.payload.record;

      state.recordsBySheet[sheetId].splice(action.payload.index, 0, Number(id));
      state.records[Number(id)] = action.payload.record;
    },
    updateRecord: (state, action: PayloadAction<{ record: Record }>) => {
      state.records[Number(action.payload.record.id)] = action.payload.record;
    },
    reorderRecord: (
      state,
      action: PayloadAction<{ sheetId: number; sourceIndex: number; destinationIndex: number }>,
    ) => {
      const recordIds = state.recordsBySheet[action.payload.sheetId];
      const [sourceRecordId] = recordIds.splice(action.payload.sourceIndex, 1);
      recordIds.splice(action.payload.destinationIndex, 0, sourceRecordId);
    },
    deleteRecord: (state, action: PayloadAction<{ record: Record }>) => {
      const { id, sheetId } = action.payload.record;

      state.recordsBySheet[sheetId] = without(state.recordsBySheet[sheetId], Number(id));
      delete state.records[Number(id)];
    },
  },
});
