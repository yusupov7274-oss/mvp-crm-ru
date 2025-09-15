// Сводная таблица по бизнесу: строки — показатели, столбцы — периоды ММ.ГГГГ.
// Возможность включать/выключать строки и экспортировать в CSV.

import React from 'react';
import * as finRepo from '../../financials/repo.local';
import * as funRepo from '../../funnel/repo.local';
import { FinancialRecord } from '../../financials/types';
import { FunnelRecord } from '../../funnel/types';
import { fmtMoney } from '../../core/money';
import { downloadCSV } from '../../core/csv';

type MetricKey =
  | 'revenue'
  | 'rent' | 'payroll' | 'internet' | 'telephony' | 'admin' | 'royalty' | 'taxes' | 'refunds' | 'accounting' | 'marketing'
  | 'net' | 'margin'
  | 'leads' | 'meetings' | 'sales'
  | 'convMeetFromLeads' | 'convSalesFromLeads' | 'convSalesFromMeet'
  | 'avgCheck' | 'newRevenue' | 'otherRevenue'
  | 'obligations';

const METRICS: Array<{ key: MetricKey; title: string; fmt?: 'money' | 'percent' | 'int' }> = [
  { key: 'revenue', title: 'Выручка', fmt: 'money' },
  { key: 'rent', title: 'Аренда', fmt: 'money' },
  { key: 'payroll', title: 'ФОТ', fmt: 'money' },
  { key: 'internet', title: 'Интернет', fmt: 'money' },
  { key: 'telephony', title: 'Телефония', fmt: 'money' },
  { key: 'admin', title: 'Адм.расходы', fmt: 'money' },
  { key: 'royalty', title: 'Роялти', fmt: 'money' },
  { key: 'taxes', title: 'Налоги', fmt: 'money' },
  { key: 'refunds', title: 'Возвраты', fmt: 'money' },
  { key: 'accounting', title: 'Бухгалтерия', fmt: 'money' },
  { key: 'marketing', title: 'Маркетинг', fmt: 'money' },
  { key: 'net', title: 'Чистая прибыль', fmt: 'money' },
  { key: 'margin', title: 'Рентабельность', fmt: 'percent' },
  { key: 'leads', title: 'Лиды', fmt: 'int' },
  { key: 'meetings', title: 'Встречи', fmt: 'int' },
  { key: 'sales', title: 'Продажи', fmt: 'int' },
  { key: 'convMeetFromLeads', title: 'Конв. встречи из лидов', fmt: 'percent' },
  { key: 'convSalesFromLeads', title: 'Конв. продажи из лидов', fmt: 'percent' },
  { key: 'convSalesFromMeet', title: 'Конв. продажи из встреч', fmt: 'percent' },
  { key: 'avgCheck', title: 'Средний чек', fmt: 'money' },
  { key: 'newRevenue', title: 'Выручка новых продаж', fmt: 'money' },
  { key: 'otherRevenue', title: 'Остальная выручка', fmt: 'money' },
  { key: 'obligations', title: 'Исполненные обязательства', fmt: 'int' },
];

export default function SummaryTable({ businessId }: { businessId: string }) {
  const [fin, setFin] = React.useState<FinancialRecord[]>([]);
  const [fun, setFun] = React.useState<FunnelRecord[]>([]);
  const [enabled, setEnabled] = React.useState<Record<MetricKey, boolean>>(() => {
    const map = {} as Record<MetricKey, boolean>;
    METRICS.forEach(m => (map[m.key] = true));
    return map;
  });

  React.useEffect(() => {
    Promise.all([finRepo.listByBusiness(businessId), funRepo.listByBusiness(businessId)]).then(
      ([f1, f2]) => {
        setFin(f1);
        setFun(f2);
      }
    );
  }, [businessId]);

  const periods = React.useMemo(() => {
    const s = new Set<string>();
    fin.forEach(r => s.add(`${r.month}.${r.year}`));
    fun.forEach(r => s.add(`${r.month}.${r.year}`));
    return Array.from(s).sort((a, b) => {
      const [am, ay] = a.split('.'); const [bm, by] = b.split('.');
      return (ay + am).localeCompare(by + bm);
    });
  }, [fin, fun]);

  function cell(period: string, key: MetricKey): string {
    const [m, y] = period.split('.');
    const f = fin.find(r => r.month === m && r.year === y);
    const u = fun.find(r => r.month === m && r.year === y);

    // конверсии/выручки новых продаж
    const leads = u?.leads || 0;
    const meetings = u?.meetings || 0;
    const sales = u?.sales || 0;
    const avgCheck = u?.avgCheck || 0;
    const convMeetFromLeads = leads ? Math.round((meetings / leads) * 100) : 0;
    const convSalesFromLeads = leads ? Math.round((sales / leads) * 100) : 0;
    const convSalesFromMeet = meetings ? Math.round((sales / meetings) * 100) : 0;
    const newRevenue = Math.round(sales * avgCheck);
    const revenue = f?.revenue || 0;
    const otherRevenue = Math.max(0, revenue - newRevenue);

    switch (key) {
      case 'revenue': return fmtMoney(revenue);
      case 'rent': return fmtMoney(f?.expenses.rent || 0);
      case 'payroll': return fmtMoney(f?.expenses.payroll || 0);
      case 'internet': return fmtMoney(f?.expenses.internet || 0);
      case 'telephony': return fmtMoney(f?.expenses.telephony || 0);
      case 'admin': return fmtMoney(f?.expenses.admin || 0);
      case 'royalty': return fmtMoney(f?.expenses.royalty || 0);
      case 'taxes': return fmtMoney(f?.expenses.taxes || 0);
      case 'refunds': return fmtMoney(f?.expenses.refunds || 0);
      case 'accounting': return fmtMoney(f?.expenses.accounting || 0);
      case 'marketing': return fmtMoney(f?.expenses.marketing || 0);
      case 'net': return fmtMoney(f?.net || 0);
      case 'margin': return f ? `${f.margin}%` : '—';
      case 'leads': return u ? String(u.leads) : '—';
      case 'meetings': return u ? String(u.meetings) : '—';
      case 'sales': return u ? String(u.sales) : '—';
      case 'convMeetFromLeads': return u ? `${convMeetFromLeads}%` : '—';
      case 'convSalesFromLeads': return u ? `${convSalesFromLeads}%` : '—';
      case 'convSalesFromMeet': return u ? `${convSalesFromMeet}%` : '—';
      case 'avgCheck': return u ? fmtMoney(u.avgCheck) : '—';
      case 'newRevenue': return u ? fmtMoney(newRevenue) : '—';
      case 'otherRevenue': return u ? fmtMoney(otherRevenue) : (f ? fmtMoney(otherRevenue) : '—');
      case 'obligations': return u ? String(u.obligations) : '—';
      default: return '—';
    }
  }

  function toggle(key: MetricKey) {
    setEnabled(prev => ({ ...prev, [key]: !prev[key] }));
  }

  function exportCSV() {
    const head = ['Показатель', ...periods];
    const rows: string[][] = [head];
    METRICS.filter(m => enabled[m.key]).forEach(m => {
      const row = [m.title, ...periods.map(p => cell(p, m.key))];
      rows.push(row);
    });
    downloadCSV(`summary_${businessId}.csv`, rows);
  }

  return (
    <div style={wrap}>
      <div style={rowBetween}>
        <h3 style={{ margin: 0 }}>Сводная таблица</h3>
        <button style={btnPrimary} onClick={exportCSV}>Экспорт CSV</button>
      </div>

      <details style={filterBox}>
        <summary style={{ cursor: 'pointer' }}>Показатели (включить/выключить)</summary>
        <div style={checks}>
          {METRICS.map(m => (
            <label key={m.key} style={checkItem}>
              <input
                type="checkbox"
                checked={!!enabled[m.key]}
                onChange={() => toggle(m.key)}
              />
              <span>{m.title}</span>
            </label>
          ))}
        </div>
      </details>

      <div style={{ overflowX: 'auto' }}>
        <table style={table}>
          <thead>
            <tr>
              <th style={th}>Показатель</th>
              {periods.map(p => <th key={p} style={th}>{p}</th>)}
            </tr>
          </thead>
          <tbody>
            {METRICS.filter(m => enabled[m.key]).map(m => (
              <tr key={m.key}>
                <td style={tdLabel}>{m.title}</td>
                {periods.map(p => <td key={p} style={tdNum}>{cell(p, m.key)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* стили */
const wrap: React.CSSProperties = { background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:12, marginTop:12 };
const rowBetween: React.CSSProperties = { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 };
const filterBox: React.CSSProperties = { marginBottom:8, border:'1px dashed #e5e7eb', padding:8, borderRadius:8, background:'#fafafa' };
const checks: React.CSSProperties = { display:'grid', gridTemplateColumns:'repeat(3, minmax(0,1fr))', gap:6, marginTop:8 };
const checkItem: React.CSSProperties = { display:'flex', alignItems:'center', gap:8, fontSize:12, border:'1px solid #eee', padding:'6px 8px', borderRadius:8, background:'#fff' };
const table: React.CSSProperties = { width:'100%', borderCollapse:'collapse', fontSize:14 };
const th: React.CSSProperties = { border:'1px solid #e5e7eb', padding:'6px 8px', background:'#f9fafb', textAlign:'right' };
const tdLabel: React.CSSProperties = { border:'1px solid #e5e7eb', padding:'6px 8px', fontWeight:600, textAlign:'left', whiteSpace:'nowrap' };
const tdNum: React.CSSProperties = { border:'1px solid #e5e7eb', padding:'6px 8px', textAlign:'right', whiteSpace:'nowrap' };
const btnPrimary: React.CSSProperties = { padding:'8px 12px', borderRadius:10, border:'1px solid #111', background:'#111', color:'#fff', cursor:'pointer' };
