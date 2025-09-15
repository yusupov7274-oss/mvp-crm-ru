// Вся математика: роялти, ЧП, маржа

import { FinancialRecord } from './types';

export function recalc(r: FinancialRecord): FinancialRecord {
  const refunds = safe(r.expenses.refunds);
  const revenue = safe(r.revenue);
  const base = r.royaltyIncludeRefunds ? Math.max(0, revenue - refunds) : revenue;

  const royalty = Math.round(base * safe(r.royaltyPercent) / 100);
  r.expenses.royalty = royalty;

  const totalExp = Object.values(r.expenses).reduce((a, b) => a + safe(b), 0);
  const net = revenue - totalExp;
  r.net = net;
  r.margin = revenue > 0 ? Math.round((net / revenue) * 100) : 0;
  return r;
}

export function newRecord(businessId: string): FinancialRecord {
  const now = new Date();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const y = String(now.getFullYear());
  return {
    id: uid(),
    businessId,
    month: m,
    year: y,
    revenue: 0,
    royaltyPercent: 0,
    royaltyIncludeRefunds: true,
    expenses: {
      rent: 0, payroll: 0, internet: 0, telephony: 0, admin: 0,
      royalty: 0, taxes: 0, refunds: 0, accounting: 0, marketing: 0,
    },
    net: 0,
    margin: 0,
  };
}

function safe(n: number | undefined | null): number { return Number(n || 0); }
function uid(){ return Math.random().toString(36).slice(2, 10); }
