// Локальный репозиторий бизнесов на localStorage (UI зависит только от этих функций)

import { Business, newBusiness } from './types';

const KEY = 'crm_businesses_v1';

function load(): Business[] {
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) as Business[] : [];
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}

function save(list: Business[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

// API репозитория

export async function listAll(): Promise<Business[]> {
  return load().sort((a,b)=> (b.updatedAt || '').localeCompare(a.updatedAt || ''));
}

export async function listPool(): Promise<Business[]> {
  return (await listAll()).filter(b => !b.responsibleId);
}

export async function listByResponsible(userId: string): Promise<Business[]> {
  return (await listAll()).filter(b => b.responsibleId === userId);
}

export async function get(id: string): Promise<Business | null> {
  return load().find(b => b.id === id) || null;
}

export async function create(input: Partial<Business>): Promise<Business> {
  const list = load();
  const b: Business = { ...newBusiness(), ...input, id: newBusiness().id }; // гарантируем новый id
  b.createdAt = new Date().toISOString();
  b.updatedAt = b.createdAt;
  list.unshift(b);
  save(list);
  return b;
}

export async function update(id: string, patch: Partial<Business>): Promise<Business> {
  const list = load();
  const i = list.findIndex(b => b.id === id);
  if (i < 0) throw new Error('Бизнес не найден');
  const next = { ...list[i], ...patch, updatedAt: new Date().toISOString() } as Business;
  list[i] = next;
  save(list);
  return next;
}

export async function assign(businessId: string, managerId: string | null): Promise<void> {
  await update(businessId, {
    responsibleId: managerId,
    status: managerId ? 'assigned' : 'new',
  });
}

export async function remove(id: string): Promise<void> {
  const list = load().filter(b => b.id !== id);
  save(list);
}
