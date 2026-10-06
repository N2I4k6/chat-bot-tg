import type { RootState } from '../../app/store';

export const selectCredentials = (state: RootState) => state.chat.credentials;
export const selectChatId = (state: RootState) => state.chat.chatId;
export const selectMessages = (state: RootState) => state.chat.messages;
export const selectIsLoading = (state: RootState) => state.chat.isLoading;
export const selectError = (state: RootState) => state.chat.error;
export const selectIsAuthenticated = (state: RootState) =>
  Boolean(state.chat.credentials);