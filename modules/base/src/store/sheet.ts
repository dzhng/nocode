import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Sheet, Operation, FieldType } from 'shared/schema';

export interface State {
  sheets: { [sheetId: number]: Sheet };
  // maps the id of latest change record to the sheet id, used to compare if the sheet is out of date from server record
  latestOp: { [sheetId: number]: Operation };
}

const initialState: State = {
  sheets: {},
  latestOp: {},
};

export default createSlice({
  name: 'sheet',
  initialState,
  reducers: {
    setSheetsForApp: (state, action: PayloadAction<{ appId: number; sheets: Sheet[] }>) => {
      // override all sheets with given appId
      Object.keys(state.sheets).forEach((key) => {
        const value = state.sheets[Number(key)];
        if (value.appId === action.payload.appId) {
          delete state.sheets[Number(key)];
        }
      });

      action.payload.sheets.forEach((sheet) => {
        state.sheets[Number(sheet.id)] = sheet;
      });
    },
    addSheet: (state, action: PayloadAction<{ sheet: Sheet }>) => {
      state.sheets[Number(action.payload.sheet.id)] = action.payload.sheet;
    },
    removeSheet: (state, action: PayloadAction<{ sheetId: number }>) => {
      delete state.sheets[action.payload.sheetId];
    },
    setLatestOpForSheet: (
      state,
      action: PayloadAction<{ sheetId: number; operation: Operation }>,
    ) => {
      state.latestOp[action.payload.sheetId] = action.payload.operation;
    },
    updateFields: (state, action: PayloadAction<{ sheetId: number; fields: FieldType[] }>) => {
      state.sheets[action.payload.sheetId].fields = action.payload.fields;
    },
  },
});
