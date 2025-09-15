import React, { useEffect, useState } from 'react';

/**
 * Простая карточка бизнеса.
 * - Данные сохраняются в localStorage браузера (переживают перезагрузку страницы).
 * - Позже сюда добавим переходы к финансам и воронке.
 */

type Kind = 'own' | 'franchise';

type BusinessBase = {
  title: string;
  city: string;
  direction: string;
  contacts: string;
  kind: Kind;
};

const STORAGE_KEY = 'crm_business_card_v1';

const initial: BusinessBase = {
  title: '',
  city: '',
  direction: '',
  contacts: '',
  kind: 'own',
};

function load(): BusinessBase {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...initial, ...JSON.parse(raw) } : initial;
  } catch {
    return initial;
  }
}

export default function BusinessCard() {
  const [data, setData] = useState<BusinessBase>(() => load());
  const [savedAt, setSavedAt] = useState<string>('');

  // Автосохранение при каждом изменении
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setSavedAt(new Date().toLocaleTimeString('ru-RU'));
  }, [data]);

  const on = <K extends keyof BusinessBase>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setData({ ...data, [key]: e.target.value });

  const setKind = (kind: Kind) => setData({ ...data, kind });

  const reset = () => setData(initial);

  return (
    <div style={{ marginTop: 16, padding: 16, border: '1px solid #ddd', borderRadius: 12, maxWidth: 720 }}>
      <h2 style={{ marginTop: 0 }}>Карточка бизнеса</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <label style={{ fontSize: 12 }}>
          <div style={{ color: '#666', marginBottom: 4 }}>Название</div>
          <input value={data.title} onChange={on('title')} style={field} placeholder="ООО «Ромашка»" />
        </label>

        <label style={{ fontSize: 12 }}>
          <div style={{ color: '#666', marginBottom: 4 }}>Город</div>
          <input value={data.city} onChange={on('city')} style={field} placeholder="Москва" />
        </label>

        <label style={{ gridColumn: '1 / span 2', fontSize: 12 }}>
          <div style={{ color: '#666', marginBottom: 4 }}>Направление бизнеса</div>
          <input value={data.direction} onChange={on('direction')} style={field} placeholder="Общепит / Розница / Услуги" />
        </label>

        <div style={{ gridColumn: '1 / span 2', fontSize: 12 }}>
          <div style={{ color: '#666', marginBottom: 8 }}>Вид бизнеса</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={() => setKind('own')}
              style={{ ...chip, ...(data.kind === 'own' ? chipActive : {}) }}
            >
              Собственный
            </button>
            <button
              type="button"
              onClick={() => setKind('franchise')}
              style={{ ...chip, ...(data.kind === 'franchise' ? chipActive : {}) }}
            >
              Франшизный
            </button>
          </div>
        </div>

        <label style={{ gridColumn: '1 / span 2', fontSize: 12 }}>
          <div style={{ color: '#666', marginBottom: 4 }}>Контакты (телефон / e-mail / заметки)</div>
          <textarea value={data.contacts} onChange={on('contacts')} style={{ ...field, height: 96 }} placeholder="+7 900 000-00-00, name@mail.ru" />
        </label>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button type="button" onClick={reset} style={btnSecondary}>Очистить</button>
      </div>

      <hr style={{ margin: '16px 0' }} />

      <h3 style={{ marginTop: 0 }}>Сводка</h3>
      <p><b>Название:</b> {data.title || '—'}</p>
      <p><b>Город:</b> {data.city || '—'}</p>
      <p><b>Направление:</b> {data.direction || '—'}</p>
      <p><b>Тип:</b> {data.kind === 'own' ? 'Собственный' : 'Франшизный'}</p>
      <p><b>Контакты:</b> {data.contacts || '—'}</p>

      <div style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
        Автосохранение: {savedAt ? `в ${savedAt}` : '—'}
      </div>
    </div>
  );
}

// Простые стили
const field: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  border: '1px solid #ccc',
  borderRadius: 8,
  fontSize: 14,
};

const chip: React.CSSProperties = {
  padding: '8px 12px',
  borderRadius: 999,
  border: '1px solid #ccc',
  background: '#fff',
  cursor: 'pointer',
};

const chipActive: React.CSSProperties = {
  background: '#000',
  color: '#fff',
  borderColor: '#000',
};

const btnSecondary: React.CSSProperties = {
  padding: '8px 12px',
  borderRadius: 8,
  border: '1px solid #ccc',
  background: '#f6f6f6',
  cursor: 'pointer',
};
