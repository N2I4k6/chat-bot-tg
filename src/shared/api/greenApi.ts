import axios from 'axios';
import type { AxiosInstance } from 'axios';
import type {
  GreenApiCredentials,
  SendMessageRequest,
  SendMessageResponse,
  ReceiveNotificationResponse,
  CheckAccountResponse,
} from '../types/greenApi.types';

const API_HOST = 'https://api.green-api.com';

class GreenApiClient {
  private http: AxiosInstance;
  private credentials: GreenApiCredentials | null = null;

  constructor() {
    this.http = axios.create({
      baseURL: API_HOST,
      timeout: 60000,
    });
  }

  setCredentials(credentials: GreenApiCredentials): void {
    this.credentials = credentials;
  }

  private ensureCredentials(): GreenApiCredentials {
    if (!this.credentials) {
      throw new Error('Green API credentials not configured');
    }
    return this.credentials;
  }

  private buildUrl(method: string): string {
    const { idInstance, apiTokenInstance } = this.ensureCredentials();
    return `/waInstance${idInstance}/${method}/${apiTokenInstance}`;
  }

  async checkAccount(phoneNumber: string): Promise<CheckAccountResponse> {
    const digits = phoneNumber.replace(/\D/g, '');
    const { data } = await this.http.post<CheckAccountResponse>(
      this.buildUrl('checkAccount'),
      { phoneNumber: Number(digits) }
    );
    return data;
  }

  async sendMessage(
    chatId: string,
    message: string
  ): Promise<SendMessageResponse> {
    const payload: SendMessageRequest = { chatId, message };
    const { data } = await this.http.post<SendMessageResponse>(
      this.buildUrl('sendMessage'),
      payload
    );
    return data;
  }

  async receiveNotification(): Promise<ReceiveNotificationResponse | null> {
    const { data } = await this.http.get<ReceiveNotificationResponse | null>(
      this.buildUrl('receiveNotification')
    );
    return data;
  }

  async deleteNotification(receiptId: number): Promise<void> {
    await this.http.delete(
      `${this.buildUrl('deleteNotification')}/${receiptId}`
    );
  }
}

export const greenApi = new GreenApiClient();