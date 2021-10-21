import { configureStore } from '@reduxjs/toolkit';
import sheetSlice from './sheet';
import recordSlice from './record';

export const store = configureStore({
  reducer: {
    [sheetSlice.name]: sheetSlice.reducer,
    [recordSlice.name]: recordSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
