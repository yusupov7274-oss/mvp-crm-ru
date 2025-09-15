import React, { useEffect, useMemo, useState } from 'react';

/**
 * ШАГ 1. БАЗОВАЯ КАРТОЧКА БИЗНЕСА (один бизнес, хранение в localStorage)
 * — Поля: Название, Город, Направление, Тип (Собственный/Франшизный), Контакты
 * — Автосохранение в localStorage
 * — Кнопка «Очистить»
 *
 * Дальше мы расширим: список бизнесов, финансы, воронка, сводная таблица.
 */

type Kind = 'own' | 'franchise';

type BusinessCardData = {
  title: string;
  city: string;
  direction: string;
  contacts: string;
  kind: Kind;
};

const STORAGE_KEY = 'crm_v1_business_card';

const initialData: BusinessCardData = {
  title: '',
  city: '',
  direction: '',
  contacts: '',
  kind: 'own',
};

function load(): BusinessCardData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...initialData, ...JSON.parse(raw) } : initialData;
  } catch {
    return initialData;
  }
}

export default function App() {
  const [data, setData] = useState<BusinessCardData>(() => load());
  const [savedAt, setSavedAt] = useState<string>('');

  // Автосохранение при каждом изменении полей
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setSavedAt(new Date().toLocaleTimeString('ru-RU'));
    } catch {
      // игнор: если localStorage недоступен
    }
  }, [data]);

  const set = <K extends keyof BusinessCardData>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setData(prev => ({ ...prev, [key]: e.target.value }));

  const setKind = (kind: Kind) => setData(prev => ({ ...prev, kind }));
  const reset = () => setData(initialData);

  const titleView = useMemo(() => data.title?.trim() || '—', [data.title]);

  return (
    <div style={page}>
      <header style={header}>
        <h1 style={h1}>CRM для продажи бизнесов</h1>
        <div style={sub}>Шаг 1: базовая карточка. Данные сохраняются в браузере.</div>
      </header>

      <section style={card}>
        <h2 style={h2}>Карточка бизнеса</h2>

        <div style={grid2}>
          <Field label="Название">
            <input style={input} value={data.title} onChange={set('title')} placeholder="ООО «Ромашка»" />
          </Field>

          <Field label="Город">
            <input style={input} value={data.city} onChange={set('city')} placeholder="Москва" />
          </Field>

          <Field label="Направление бизнеса" span2>
            <input
              style={input}
              value={data.direction}
              onChange={set('direction')}
              placeholder="Общепит / Розница / Услуги"
            />
          </Field>

          <div style={{ gridColumn: '1 / span 2' }}>
            <Label>Вид бизнеса</Label>
            <div style={chips}>
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

          <Field label="Контакты (телефон / e-mail / заметки)" span2>
            <textarea
              style={{ ...input, height: 96, resize: 'vertical' }}
              value={data.contacts}
              onChange={set('contacts')}
              placeholder="+7 900 000-00-00, name@mail.ru"
            />
          </Field>
        </div>

        <div style={actions}>
          <button type="button" onClick={reset} style={btnSecondary}>Очистить</button>
        </div>

        <hr style={hr} />

        <h3 style={h3}>Сводка</h3>
        <dl style={dl}>
          <Row k="Название" v={titleView} />
          <Row k="Город" v={data.city || '—'} />
          <Row k="Направление" v={data.direction || '—'} />
          <Row k="Тип" v={data.kind === 'own' ? 'Собственный' : 'Франшизный'} />
          <Row k="Контакты" v={data.contacts || '—'} />
        </dl>

        <div style={saveNote}>Автосохранение: {savedAt ? `в ${savedAt}` : '—'}</div>
      </section>
    </div>
  );
}

/* ───────────────── UI маленькие утилиты ──────────────── */
function Field(props: { label: string; children: React.ReactNode; span2?: boolean }) {
  return (
    <label style={{ display: 'block', gridColumn: props.span2 ? '1 / span 2' : undefined }}>
      <Label>{props.label}</Label>
      {props.children}
    </label>
  );
}
function Label({ children }: { children: React.ReactNode }) {
  return <div style={label}>{children}</div>;
}
function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div style={row}>
      <div style={rowKey}>{k}</div>
      <div style={rowVal}>{v}</div>
    </div>
  );
}

/* ───────────────── Стили (inline, без внешних библиотек) ──────────────── */
const page: React.CSSProperties = {
  padding: '24px',
  fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
  maxWidth: 980,
  margin: '0 auto',
};

const header: React.CSSProperties = { marginBottom: 12 };
const h1: React.CSSProperties = { margin: 0, fontSize: 26 };
const sub: React.CSSProperties = { color: '#666', marginTop: 4, fontSize: 14 };

const card: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #e5e5e5',
  borderRadius: 14,
  padding: 16,
};

const h2: React.CSSProperties = { margin: '4px 0 12px', fontSize: 18 };
const h3: React.CSSProperties = { margin: '8px 0', fontSize: 16 };

const grid2: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 12,
};

const input: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #cfd3d8',
  borderRadius: 10,
  fontSize: 14,
  outline: 'none',
};

const label: React.CSSProperties = { color: '#6b7280', fontSize: 12, marginBottom: 6 };

const chips: React.CSSProperties = { display: 'flex', gap: 8 };
const chip: React.CSSProperties = {
  padding: '8px 12px',
  borderRadius: 999,
  border: '1px solid #cfd3d8',
  background: '#fff',
  cursor: 'pointer',
};
const chipActive: React.CSSProperties = { background: '#111', color: '#fff', borderColor: '#111' };

const actions: React.CSSProperties = { display: 'flex', gap: 8, marginTop: 12 };
const btnSecondary: React.CSSProperties = {
  padding: '10px 14px',
  borderRadius: 10,
  border: '1px solid #cfd3d8',
  background: '#f6f7f9',
  cursor: 'pointer',
};

const hr: React.CSSProperties = { margin: '16px 0', border: 0, borderTop: '1px solid #eee' };
const dl: React.CSSProperties = { margin: 0 };
const row: React.CSSProperties = { display: 'grid', gridTemplateColumns: '220px 1fr', padding: '6px 0', borderBottom: '1px solid #f2f2f2' };
const rowKey: React.CSSProperties = { color: '#6b7280' };
const rowVal: React.CSSProperties = { fontWeight: 500 };

const saveNote: React.CSSProperties = { fontSize: 12, color: '#6b7280', marginTop: 8 };
