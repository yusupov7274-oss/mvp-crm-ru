// Локальное хранилище воронки

import { FunnelRecord } from './types';

const KEY = 'crm_funnel_v1';

function load(): FunnelRecord[] {
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) as FunnelRecord[] : [];
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}
function save(list: FunnelRecord[]){
  localStorage.setItem(KEY, JSON.stringify(list));
}

export async function listByBusiness(businessId: string): Promise<FunnelRecord[]> {
  return load().filter(x=>x.businessId===businessId)
    .sort((a,b)=> (a.year+a.month).localeCompare(b.year+b.month));
}

export async function upsert(rec: FunnelRecord): Promise<FunnelRecord> {
  const list = load();
  const i = list.findIndex(x=>x.id===rec.id);
  if (i<0) list.push(rec); else list[i] = rec;
  save(list);
  return rec;
}

export async function remove(id: string): Promise<void> {
  save(load().filter(x=>x.id!==id));
}
