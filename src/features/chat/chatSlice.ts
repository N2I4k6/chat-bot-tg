import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { greenApi } from "../../shared/api/greenApi";
import type {
  GreenApiCredentials,
  Message,
} from "../../shared/types/greenApi.types";

const STORAGE_KEY = "greenApiCredentials";

interface ChatState {
  credentials: GreenApiCredentials | null;
  chatId: string | null;
  messages: Message[];
  isLoading: boolean;
  isPolling: boolean;
  error: string | null;
}

function loadCredentials(): GreenApiCredentials | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as GreenApiCredentials) : null;
  } catch {
    return null;
  }
}

const initialState: ChatState = {
  credentials: loadCredentials(),
  chatId: null,
  messages: [],
  isLoading: false,
  isPolling: false,
  error: null,
};

export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async (
    { chatId, text }: { chatId: string; text: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await greenApi.sendMessage(chatId, text);
      return response.idMessage;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to send message"
      );
    }
  }
);

export const checkAndCreateChat = createAsyncThunk(
  "chat/checkAndCreateChat",
  async (phone: string, { rejectWithValue }) => {
    try {
      const result = await greenApi.checkAccount(phone);
      if (!result.exist) {
        return rejectWithValue("Аккаунт Telegram с таким номером не найден");
      }
      return result.chatId;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Ошибка проверки аккаунта"
      );
    }
  }
);

export const pollNotification = createAsyncThunk(
  "chat/pollNotification",
  async (_, { dispatch, getState, rejectWithValue }) => {
    try {
      const notification = await greenApi.receiveNotification();
      if (!notification) return null;

      try {
        await greenApi.deleteNotification(notification.receiptId);
      } catch {
        console.log('error')
      }

      const { body } = notification;

      if (
        body.typeWebhook === "incomingMessageReceived" &&
        body.messageData?.typeMessage === "textMessage"
      ) {
        const text = body.messageData.textMessageData?.textMessage;
        if (text) {
          const state = getState() as { chat: ChatState };
          if (state.chat.chatId === body.senderData?.chatId) {
            dispatch(
              addIncomingMessage({
                id: body.idMessage,
                text,
                senderName: body.senderData?.senderName || "Unknown",
              })
            );
          }
        }
      }

      return notification;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Polling error"
      );
    }
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<GreenApiCredentials>) {
      state.credentials = action.payload;
      greenApi.setCredentials(action.payload);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(action.payload));
    },
    logout(state) {
      state.credentials = null;
      state.chatId = null;
      state.messages = [];
      localStorage.removeItem(STORAGE_KEY);
    },
    setChatId(state, action: PayloadAction<string>) {
      state.chatId = action.payload;
      state.messages = [];
    },
    addIncomingMessage(
      state,
      action: PayloadAction<{
        id: string;
        text: string;
        senderName: string;
      }>
    ) {
      state.messages.push({
        id: action.payload.id,
        text: action.payload.text,
        isOutgoing: false,
        timestamp: Date.now(),
        senderName: action.payload.senderName,
      });
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendMessage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages.push({
          id: action.payload,
          text: action.meta.arg.text,
          isOutgoing: true,
          timestamp: Date.now(),
          senderName: "You",
        });
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(checkAndCreateChat.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkAndCreateChat.fulfilled, (state, action) => {
        state.isLoading = false;
        state.chatId = action.payload;
        state.messages = [];
      })
      .addCase(checkAndCreateChat.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(pollNotification.pending, (state) => {
        state.isPolling = true;
      })
      .addCase(pollNotification.fulfilled, (state) => {
        state.isPolling = false;
      })
      .addCase(pollNotification.rejected, (state) => {
        state.isPolling = false;
      });
  },
});

export const {
  setCredentials,
  logout,
  setChatId,
  addIncomingMessage,
  clearError,
} = chatSlice.actions;

export default chatSlice.reducer;
