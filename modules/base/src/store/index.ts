import { configureStore } from '@reduxjs/toolkit';
import sheetSlice from './sheet';

export const store = configureStore({
  reducer: {
    [sheetSlice.name]: sheetSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
