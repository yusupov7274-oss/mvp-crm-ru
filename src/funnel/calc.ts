// Формулы конверсий и выручки новых продаж

import { FunnelRecord, FunnelComputed } from './types';

export function compute(r: FunnelRecord): FunnelComputed {
  const leads = n(r.leads);
  const meetings = n(r.meetings);
  const sales = n(r.sales);
  const avgCheck = n(r.avgCheck);

  const convMeetFromLeads = leads ? Math.round((meetings / leads) * 100) : 0;
  const convSalesFromLeads = leads ? Math.round((sales / leads) * 100) : 0;
  const convSalesFromMeet = meetings ? Math.round((sales / meetings) * 100) : 0;
  const newRevenue = Math.round(sales * avgCheck);

  return { convMeetFromLeads, convSalesFromLeads, convSalesFromMeet, newRevenue };
}

export function newFunnelRecord(businessId: string): FunnelRecord {
  const now = new Date();
  return {
    id: uid(),
    businessId,
    month: String(now.getMonth() + 1).padStart(2, '0'),
    year: String(now.getFullYear()),
    leads: 0,
    meetings: 0,
    sales: 0,
    avgCheck: 0,
    obligations: 0,
  };
}

function n(x: number | undefined | null) { return Number(x || 0); }
function uid(){ return Math.random().toString(36).slice(2,10); }
