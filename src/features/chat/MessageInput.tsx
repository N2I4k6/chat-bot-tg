import { useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { sendMessage } from './chatSlice';
import { selectChatId, selectIsLoading } from './chatSelectors';
import styles from './MessageInput.module.scss';

export const MessageInput = () => {
  const dispatch = useAppDispatch();
  const chatId = useAppSelector(selectChatId);
  const isLoading = useAppSelector(selectIsLoading);
  const [text, setText] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !chatId || isLoading) return;

    dispatch(sendMessage({ chatId, text: text.trim() }));
    setText('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <input
        className={styles.input}
        type="text"
        placeholder="Введите сообщение..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isLoading}
      />
      <button
        className={styles.button}
        type="submit"
        disabled={!text.trim() || isLoading}
      >
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
        </svg>
      </button>
    </form>
  );
};