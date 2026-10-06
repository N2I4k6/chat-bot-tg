import { useEffect, useRef } from 'react';
import { useAppSelector } from '../../app/hooks';
import { selectMessages } from './chatSelectors';
import styles from './MessageList.module.scss';

export const MessageList = () => {
  const messages = useAppSelector(selectMessages);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  if (messages.length === 0) {
    return (
      <div className={styles.empty}>
        <p>Нет сообщений. Начните диалог!</p>
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`${styles.message} ${
            msg.isOutgoing ? styles.outgoing : styles.incoming
          }`}
        >
          <div className={styles.bubble}>
            <span className={styles.text}>{msg.text}</span>
            <span className={styles.time}>
              {new Date(msg.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
};