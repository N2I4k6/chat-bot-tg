import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  checkAndCreateChat,
  pollNotification,
  clearError,
  logout,
} from './chatSlice';
import {
  selectChatId,
  selectError,
  selectIsAuthenticated,
  selectIsLoading,
} from './chatSelectors';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { LoginForm } from './LoginForm';
import styles from './ChatPage.module.scss';

export const ChatPage = () => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const chatId = useAppSelector(selectChatId);
  const error = useAppSelector(selectError);
  const isLoading = useAppSelector(selectIsLoading);
  const [phone, setPhone] = useState('');
  const pollStartedRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || pollStartedRef.current) return;
    pollStartedRef.current = true;

    let cancelled = false;

    const loop = async () => {
      while (!cancelled) {
        try {
          await dispatch(pollNotification()).unwrap();
        } catch {
          console.log('error')
        }
        if (cancelled) break;
       
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    };

    loop();

    return () => {
      cancelled = true;
      pollStartedRef.current = false;
    };
  }, [isAuthenticated, dispatch]);

  const handleCreateChat = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = phone.trim();
    if (!trimmed) return;
    dispatch(checkAndCreateChat(trimmed));
  };

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Telegram Chat</h1>
        <button
          className={styles.logout}
          onClick={() => dispatch(logout())}
          type="button"
        >
          Выйти
        </button>
      </header>

      {error && (
        <div className={styles.error} onClick={() => dispatch(clearError())}>
          {error} (нажмите чтобы закрыть)
        </div>
      )}

      {!chatId ? (
        <div className={styles.chatSetup}>
          <form className={styles.chatForm} onSubmit={handleCreateChat}>
            <h2>Новый чат</h2>
            <input
              className={styles.input}
              type="tel"
              placeholder="Номер телефона (например: 79991234567)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isLoading}
            />
            <button
              className={styles.button}
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Проверяем...' : 'Создать чат'}
            </button>
          </form>
        </div>
      ) : (
        <div className={styles.chat}>
          <div className={styles.chatHeader}>
            <span className={styles.chatId}>Chat ID: {chatId}</span>
          </div>
          <MessageList />
          <MessageInput />
        </div>
      )}
    </div>
  );
};