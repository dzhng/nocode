import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Sheet } from 'shared/schema';

export interface State {
  sheets: Sheet[];
}

const initialState: State = {
  sheets: [],
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
  },
});