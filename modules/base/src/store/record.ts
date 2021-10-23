import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { forEach, without } from 'lodash';
import { Record, CellType } from 'shared/schema';

export interface State {
  // key is sheetId, value is array of sorted record slugs
  recordsBySheet: { [sheetId: number]: string[] };
  records: { [slug: string]: Record };
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
      const slugs = sorted.map((record) => record.slug);

      state.recordsBySheet[action.payload.sheetId] = slugs;

      // first, scan through all records and delete the ones with same sheetId, since we are going to override all records with the new records
      forEach(state.records, (value, key) => {
        if (value.sheetId === action.payload.sheetId) {
          delete state.records[key];
        }
      });

      // next, insert new records
      sorted.forEach((record) => {
        state.records[record.slug] = record;
      });
    },
    createRecord: (state, action: PayloadAction<{ record: Record; index: number }>) => {
      const { slug, sheetId } = action.payload.record;

      state.recordsBySheet[sheetId].splice(action.payload.index, 0, slug);
      state.records[slug] = action.payload.record;
    },
    updateRecordData: (
      state,
      action: PayloadAction<{ slug: string; fieldId: string; data: CellType }>,
    ) => {
      const record = state.records[action.payload.slug];
      record.cells = [
        ...(record.cells?.filter(([id]) => id !== action.payload.fieldId) ?? []),
        [action.payload.fieldId, action.payload.data],
      ];
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
      const { slug, sheetId } = action.payload.record;

      state.recordsBySheet[sheetId] = without(state.recordsBySheet[sheetId], slug);
      delete state.records[slug];
    },
  },
});
