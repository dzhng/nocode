import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { forEach } from 'lodash';
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
      const ids = sorted.map((record) => record.id ?? -1);

      state.recordsBySheet[action.payload.sheetId] = ids;

      // first, scan through all records and delete the ones with same sheetId, since we are going to override all records with the new records
      forEach(state.records, (value, key) => {
        if (value.sheetId === action.payload.sheetId) {
          delete state.records[Number(key)];
        }
      });

      // next, insert new records
      sorted.forEach((record) => {
        state.records[record.id ?? -1] = record;
      });
    },
    updateRecord: (state, action: PayloadAction<{ record: Record }>) => {
      state.records[action.payload.record.id ?? -1] = action.payload.record;
    },
    reorderRecord: (
      state,
      action: PayloadAction<{ sheetId: number; sourceIndex: number; destinationIndex: number }>,
    ) => {
      const recordIds = state.recordsBySheet[action.payload.sheetId];
      const [sourceRecordId] = recordIds.splice(action.payload.sourceIndex, 1);
      recordIds.splice(action.payload.destinationIndex, 0, sourceRecordId);
    },
  },
});
