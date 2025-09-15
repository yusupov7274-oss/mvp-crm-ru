// Локальное хранилище финансов по бизнесу

import { FinancialRecord } from './types';
import { recalc } from './calc';

const KEY = 'crm_financials_v1';

function load(): FinancialRecord[] {
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) as FinancialRecord[] : [];
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}
function save(list: FinancialRecord[]){
  localStorage.setItem(KEY, JSON.stringify(list));
}

export async function listByBusiness(businessId: string): Promise<FinancialRecord[]> {
  return load().filter(x=>x.businessId===businessId)
    .sort((a,b)=> (a.year+a.month).localeCompare(b.year+b.month));
}

export async function upsert(input: FinancialRecord): Promise<FinancialRecord> {
  const list = load();
  const i = list.findIndex(x => x.id === input.id);
  const next = recalc({...input});
  if (i<0) list.push(next); else list[i] = next;
  save(list);
  return next;
}

export async function remove(id: string): Promise<void> {
  save(load().filter(x=>x.id!==id));
}
