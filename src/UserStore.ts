// ЛОКАЛЬНЫЙ "БЭКЕНД": пользователи, логины/пароли, переопределения прав (localStorage)
// ВНИМАНИЕ: это демо на фронтенде. Для продакшена нужен сервер и безопасное хранилище.

import { PERMISSIONS, Role, Permissions } from './roles';

export type UserRecord = {
  id: string;
  name: string;
  role: Role;
  login: string;           // уникальный логин
  passwordHash: string;    // простейший хэш (демо)
  permsOverride?: Partial<Permissions>; // переопределение прав
};

const USERS_KEY = 'crm_users_v1';

const uid = () => Math.random().toString(36).slice(2, 10);

// Псевдо-хэш (демо). Для реальной системы нужен сервер + bcrypt/argon2.
export function hash(s: string){
  let h = 2166136261;
  for (let i=0;i<s.length;i++){ h ^= s.charCodeAt(i); h += (h<<1) + (h<<4) + (h<<7) + (h<<8) + (h<<24); }
  return (h >>> 0).toString(16);
}

function load(): UserRecord[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    const users = raw ? JSON.parse(raw) as UserRecord[] : [];
    return Array.isArray(users) ? users : [];
  } catch { return []; }
}

function save(list: UserRecord[]){
  localStorage.setItem(USERS_KEY, JSON.stringify(list));
}

function ensureSeedOwner(){
  // если нет владельца — создаём демо-аккаунт
  const list = load();
  const hasOwner = list.some(u => u.role === 'owner');
  if (!hasOwner){
    list.push({
      id: uid(),
      name: 'Владелец',
      role: 'owner',
      login: 'boss',
      passwordHash: hash('boss123'), // поменяйте в панели пользователей
      permsOverride: {},
    });
    save(list);
  }
}
ensureSeedOwner();

export function listUsers(){ return load(); }

export function getUserById(id: string){ return load().find(u=>u.id===id) || null; }

export function authenticate(login: string, password: string): UserRecord | null {
  const list = load();
  const u = list.find(x => x.login === login.trim());
  if (!u) return null;
  return (u.passwordHash === hash(password)) ? u : null;
}

export function addUser(input: { name: string; role: Role; login: string; password: string; permsOverride?: Partial<Permissions> }){
  const list = load();
  if (list.some(u => u.login === input.login)) throw new Error('Логин уже используется');
  const rec: UserRecord = {
    id: uid(),
    name: input.name.trim() || input.login,
    role: input.role,
    login: input.login.trim(),
    passwordHash: hash(input.password),
    permsOverride: input.permsOverride || {},
  };
  list.push(rec);
  save(list);
  return rec;
}

export function updateUser(id: string, patch: Partial<Omit<UserRecord, 'id' | 'passwordHash'>> & { password?: string }){
  const list = load();
  const i = list.findIndex(u=>u.id===id);
  if (i<0) throw new Error('Пользователь не найден');
  const prev = list[i];
  const next: UserRecord = {
    ...prev,
    ...patch,
    passwordHash: patch.password ? hash(patch.password) : prev.passwordHash,
  };
  list[i] = next;
  save(list);
  return next;
}

export function removeUser(id: string){
  const list = load();
  const next = list.filter(u => u.id !== id);
  save(next);
}

export function permsForUser(u: UserRecord): Permissions {
  return { ...PERMISSIONS[u.role], ...(u.permsOverride || {}) };
}
