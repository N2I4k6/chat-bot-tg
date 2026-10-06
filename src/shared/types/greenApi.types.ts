export interface GreenApiCredentials {
  idInstance: string;
  apiTokenInstance: string;
}

export interface SendMessageRequest {
  chatId: string;
  message: string;
}

export interface SendMessageResponse {
  idMessage: string;
}

export interface CheckAccountRequest {
  phoneNumber: number;
}

export interface CheckAccountResponse {
  exist: boolean;
  chatId: string;
}

export interface ReceiveNotificationResponse {
  receiptId: number;
  body: {
    typeWebhook: string;
    instanceData: {
      idInstance: number;
      wid: string;
      typeInstance: string;
    };
    timestamp: number;
    idMessage: string;
    senderData: {
      chatId: string;
      sender: string;
      senderName: string;
    };
    messageData: {
      typeMessage: string;
      textMessageData?: {
        textMessage: string;
      };
    };
  };
}

export interface Message {
  id: string;
  text: string;
  isOutgoing: boolean;
  timestamp: number;
  senderName: string;
}