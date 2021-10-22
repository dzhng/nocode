import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Sheet, RecordChange } from 'shared/schema';

export interface State {
  sheets: Sheet[];
  // maps the id of latest change record to the sheet id, used to compare if the sheet is out of date from server record
  latestChange: { [sheetId: number]: RecordChange };
}

const initialState: State = {
  sheets: [],
  latestChange: {},
};

export default createSlice({
  name: 'sheet',
  initialState,
  reducers: {
    setSheetsForApp: (state, action: PayloadAction<{ appId: number; sheets: Sheet[] }>) => {
      // override all sheets with given appId
      state.sheets = [
        ...state.sheets.filter((sheet) => sheet.appId !== action.payload.appId),
        ...action.payload.sheets,
      ];
    },
    addSheet: (state, action: PayloadAction<{ sheet: Sheet }>) => {
      state.sheets.push(action.payload.sheet);
    },
    removeSheet: (state, action: PayloadAction<{ sheetId: number }>) => {
      state.sheets = state.sheets.filter((sheet) => sheet.id !== action.payload.sheetId);
    },
    setLatestChangeForSheet: (
      state,
      action: PayloadAction<{ sheetId: number; change: RecordChange }>,
    ) => {
      state.latestChange[action.payload.sheetId] = action.payload.change;
    },
  },
});
