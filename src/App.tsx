// ПРИЛОЖЕНИЕ: вход по логину/паролю, разграничение прав,
// панель владельца для управления аккаунтами/доступами.

import React from 'react';
import { AuthProvider, LoginScreen, useAuth } from './AuthGate';
import { roleTitle, Permissions, Role } from './roles';
import {
  addUser,
  listUsers,
  permsForUser,
  removeUser,
  updateUser,
  UserRecord,
} from './UserStore';

/* ───────────────── Заглушка карточки бизнеса ───────────────── */
function BusinessCardBare() {
  const [title, setTitle] = React.useState(localStorage.getItem('card_title') || '');
  const [city, setCity] = React.useState(localStorage.getItem('card_city') || '');
  const [direction, setDirection] = React.useState(localStorage.getItem('card_dir') || '');
  const [contacts, setContacts] = React.useState(localStorage.getItem('card_contacts') || '');
  React.useEffect(() => {
    localStorage.setItem('card_title', title);
    localStorage.setItem('card_city', city);
    localStorage.setItem('card_dir', direction);
    localStorage.setItem('card_contacts', contacts);
  }, [title, city, direction, contacts]);

  return (
    <div style={card}>
      <h3 style={{ marginTop: 0 }}>Карточка бизнеса</h3>
      <label style={lbl}>
        Название
        <input style={inp} value={title} onChange={(e) => setTitle(e.target.value)} />
      </label>
      <label style={lbl}>
        Город
        <input style={inp} value={city} onChange={(e) => setCity(e.target.value)} />
      </label>
      <label style={lbl}>
        Направление
        <input style={inp} value={direction} onChange={(e) => setDirection(e.target.value)} />
      </label>
      <label style={lbl}>
        Контакты
        <textarea
          style={{ ...inp, height: 90 }}
          value={contacts}
          onChange={(e) => setContacts(e.target.value)}
        />
      </label>
      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 8 }}>
        Демо: данные этой карточки сохраняются в браузере (localStorage).
      </div>
    </div>
  );
}

/* ───────────────── Панель владельца: пользователи/роли/пароли ───────────────── */
function OwnerPanel() {
  const [users, setUsers] = React.useState<UserRecord[]>(listUsers());
  const [form, setForm] = React.useState({ name: '', role: 'manager' as Role, login: '', password: '' });

  const reload = () => setUsers(listUsers());

  function create() {
    if (!form.login || !form.password) {
      alert('Укажите логин и временный пароль');
      return;
    }
    try {
      addUser(form);
      setForm({ name: '', role: 'manager', login: '', password: '' });
      reload();
    } catch (e: any) {
      alert(e?.message || String(e));
    }
  }

  function setRoleFor(id: string, role: Role) {
    updateUser(id, { role });
    reload();
  }

  function setOverride(id: string, key: keyof Permissions, val: boolean) {
    const u = users.find((x) => x.id === id);
    if (!u) return;
    const next = { ...(u.permsOverride || {}), [key]: val };
    updateUser(id, { permsOverride: next });
    reload();
  }

  function changePass(id: string) {
    const pwd = prompt('Новый пароль:');
    if (!pwd) return;
    updateUser(id, { password: pwd });
    alert('Пароль обновлён');
    reload();
  }

  function del(id: string) {
    if (!confirm('Удалить пользователя?')) return;
    removeUser(id);
    reload();
  }

  return (
    <div style={card}>
      <h3 style={{ marginTop: 0 }}>Пользователи и доступы (только владелец)</h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <label style={lbl}>
          Имя
          <input
            style={inp}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </label>
        <label style={lbl}>
          Логин
          <input
            style={inp}
            value={form.login}
            onChange={(e) => setForm({ ...form, login: e.target.value })}
          />
        </label>
        <label style={lbl}>
          Пароль (временный)
          <input
            style={inp}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </label>
        <label style={lbl}>
          Роль
          <select
            style={inp}
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
          >
            <option value="manager">Менеджер</option>
            <option value="seller">Собственник</option>
            <option value="buyer">Покупатель</option>
            <option value="owner">Владелец</option>
          </select>
        </label>
      </div>

      <div style={{ marginTop: 8 }}>
        <button style={btnPrimary} onClick={create}>
          Добавить пользователя
        </button>
      </div>

      <hr style={hr} />

      {users.map((u) => {
        const eff = permsForUser(u);
        return (
          <div key={u.id} style={{ borderTop: '1px solid #f1f1f1', paddingTop: 8, marginTop: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <b>{u.name}</b> · {u.login} · {roleTitle(u.role)}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={btnGhost} onClick={() => changePass(u.id)}>
                  Сменить пароль
                </button>
                <select
                  style={inp}
                  value={u.role}
                  onChange={(e) => setRoleFor(u.id, e.target.value as Role)}
                >
                  <option value="owner">Владелец</option>
                  <option value="manager">Менеджер</option>
                  <option value="seller">Собственник</option>
                  <option value="buyer">Покупатель</option>
                </select>
                <button style={btnDanger} onClick={() => del(u.id)}>
                  Удалить
                </button>
              </div>
            </div>

            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
              Переопределение прав (галочка = включено):
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, minmax(0,1fr))',
                gap: 6,
                marginTop: 6,
              }}
            >
              {(
                [
                  'manageUsers',
                  'viewBusiness',
                  'editBusiness',
                  'viewFinancials',
                  'editFinancials',
                  'viewFunnel',
                  'editFunnel',
                  'viewSummary',
                ] as (keyof Permissions)[]
              ).map((k) => (
                <label
                  key={k}
                  style={{
                    fontSize: 12,
                    display: 'flex',
                    gap: 6,
                    alignItems: 'center',
                    border: '1px solid #eee',
                    borderRadius: 8,
                    padding: '6px 8px',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={u.permsOverride?.[k] ?? eff[k]}
                    onChange={(e) => setOverride(u.id, k, e.target.checked)}
                  />
                  <span>{k}</span>
                </label>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ───────────────── Верхняя панель ───────────────── */
function Topbar() {
  const { user, logout } = useAuth();
  if (!user) return null;
  return (
    <div style={topbar}>
      <div>
        <b>{user.name}</b> · {roleTitle(user.role)}
      </div>
      <button style={btnGhost} onClick={logout}>
        Выйти
      </button>
    </div>
  );
}

/* ───────────────── Основная обвязка ───────────────── */
function Shell() {
  const { user, perms } = useAuth();
  if (!user || !perms) return <LoginScreen />;

  return (
    <div style={page}>
      <Topbar />
      <h1 style={{ marginTop: 8 }}>CRM для продажи бизнесов</h1>
      <p style={{ color: '#6b7280', marginTop: 0 }}>
        Доступы управляются владельцем. Текущая роль: {roleTitle(user.role)}
      </p>

      {/* Всегда видна карточка бизнеса (редактирование позже ограничим по perms.editBusiness) */}
      <BusinessCardBare />

      {/* Панель владельца — только при праве manageUsers */}
      {perms.manageUsers && (
        <>
          <hr style={hr} />
          <OwnerPanel />
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}

/* ───────────────── Стили ───────────────── */
const page: React.CSSProperties = {
  padding: '24px',
  fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
  maxWidth: 980,
  margin: '0 auto',
};

const topbar: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '10px 12px',
  border: '1px solid #e5e7eb',
  borderRadius: 12,
  background: '#fff',
  marginBottom: 12,
};

const card: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: 12,
  padding: 12,
  maxWidth: 900,
};

const lbl: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  color: '#6b7280',
  margin: '8px 0 4px',
};

const inp: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #cfd3d8',
  borderRadius: 10,
  fontSize: 14,
  outline: 'none',
};

const btnPrimary: React.CSSProperties = {
  padding: '10px 14px',
  borderRadius: 10,
  border: '1px solid #111',
  background: '#111',
  color: '#fff',
  cursor: 'pointer',
};

const btnGhost: React.CSSProperties = {
  padding: '8px 12px',
  borderRadius: 10,
  border: '1px solid #cfd3d8',
  background: '#fff',
  cursor: 'pointer',
};

const btnDanger: React.CSSProperties = {
  padding: '8px 12px',
  borderRadius: 10,
  border: '1px solid #dc2626',
  background: '#fef2f2',
  color: '#b91c1c',
  cursor: 'pointer',
};

const hr: React.CSSProperties = { margin: '16px 0', border: 0, borderTop: '1px solid #eee' };
