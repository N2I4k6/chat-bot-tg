import { useState } from 'react';
import type { FormEvent } from 'react';
import { useAppDispatch } from '../../app/hooks';
import { setCredentials } from './chatSlice';
import type { GreenApiCredentials } from '../../shared/types/greenApi.types';
import styles from './LoginForm.module.scss';

export const LoginForm = () => {
  const dispatch = useAppDispatch();
  const [form, setForm] = useState<GreenApiCredentials>({
    idInstance: '',
    apiTokenInstance: '',
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (form.idInstance.trim() && form.apiTokenInstance.trim()) {
      dispatch(setCredentials(form));
    }
  };

  return (
    <div className={styles.wrapper}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h2 className={styles.title}>Telegram Chat</h2>
        <p className={styles.subtitle}>
          Введите данные из личного кабинета GREEN-API
        </p>

        <input
          className={styles.input}
          type="text"
          placeholder="idInstance"
          value={form.idInstance}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, idInstance: e.target.value }))
          }
          required
        />

        <input
          className={styles.input}
          type="password"
          placeholder="apiTokenInstance"
          value={form.apiTokenInstance}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, apiTokenInstance: e.target.value }))
          }
          required
        />

        <button className={styles.button} type="submit">
          Войти
        </button>
      </form>
    </div>
  );
};