import { configureStore } from '@reduxjs/toolkit';
import chatReducer from '../features/chat/chatSlice';
import { greenApi } from '../shared/api/greenApi';

export const store = configureStore({
  reducer: {
    chat: chatReducer,
  },
});

const credentials = store.getState().chat.credentials;
if (credentials) {
  greenApi.setCredentials(credentials);
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;