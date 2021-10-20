import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Record, Cell } from 'shared/schema';

export interface State {
  records: { [sheetId: number]: Record[] };
  cells: { [recordId: number]: Cell[] };
}

const initialState: State = {
  records: {},
  cells: {},
};

export default createSlice({
  name: 'record',
  initialState,
  reducers: {
    setRecordsForSheet: (state, action: PayloadAction<{ sheetId: number; records: Record[] }>) => {
      // override all sheets with given appId
      state.records[action.payload.sheetId] = action.payload.records;
    },
    setCellsForRecord: (state, action: PayloadAction<>) => {},
  },
});
