import React from 'react';
import { Business } from '../../business/types';
import * as finRepo from '../../financials/repo.local';
import * as funRepo from '../../funnel/repo.local';
import { FinancialRecord } from '../../financials/types';
import { FunnelRecord } from '../../funnel/types';
import { toCSV, downloadCSV } from '../../core/csv';

type MetricKey =
  | 'revenue' | 'rent' | 'payroll' | 'internet' | 'telephony' | 'admin' | 'royalty' | 'taxes'
  | 'refunds' | 'accounting' | 'marketing' | 'net' | 'margin'
  | 'leads' | 'meetings' | 'sales'
  | 'convML' | 'convSL' | 'convSM'
  | 'avgCheck' | 'newRevenue' | 'otherRevenue' | 'obligations';

const METRICS: Array<{ key: MetricKey; label: string }> = [
  { key:'revenue', label:'Выручка' },
  { key:'rent', label:'Аренда' },
  { key:'payroll', label:'ФОТ' },
  { key:'internet', label:'Интернет' },
  { key:'telephony', label:'Телефония' },
  { key:'admin', label:'Адм. расходы' },
  { key:'royalty', label:'Роялти' },
  { key:'taxes', label:'Налоги' },
  { key:'refunds', label:'Возвраты' },
  { key:'accounting', label:'Бухгалтерия' },
  { key:'marketing', label:'Маркетинг' },
  { key:'net', label:'Чистая прибыль' },
  { key:'margin', label:'Рентабельность (%)' },
  { key:'leads', label:'Лиды' },
  { key:'meetings', label:'Встречи' },
  { key:'sales', label:'Продажи' },
  { key:'convML', label:'Конв. встречи из лидов (%)' },
  { key:'convSL', label:'Конв. продажи из лидов (%)' },
  { key:'convSM', label:'Конв. продажи из встреч (%)' },
  { key:'avgCheck', label:'Средний чек' },
  { key:'newRevenue', label:'Выручка новых продаж' },
  { key:'otherRevenue', label:'Остальная выручка' },
  { key:'obligations', label:'Исполненные обязательства' },
];

function fmt(n:number){ return Number(n||0).toLocaleString('ru-RU', { maximumFractionDigits: 0 }); }

export default function SummaryTable({ business, canExport }: { business: Business; canExport: boolean }){
  const [fin, setFin] = React.useState<FinancialRecord[]>([]);
  const [fun, setFun] = React.useState<FunnelRecord[]>([]);
  const [enabled, setEnabled] = React.useState<Record<MetricKey, boolean>>(()=> {
    const init: Record<MetricKey, boolean> = {} as any;
    METRICS.forEach(m => (init[m.key] = true));
    return init;
  });

  React.useEffect(()=>{
    finRepo.listByBusiness(business.id).then(setFin);
    funRepo.listByBusiness(business.id).then(setFun);
  }, [business.id]);

  const periods = React.useMemo(()=>{
    const set = new Set<string>();
    fin.forEach(r => set.add(`${r.month}.${r.year}`));
    fun.forEach(r => set.add(`${r.month}.${r.year}`));
    return Array.from(set).sort();
  }, [fin, fun]);

  function value(period: string, key: MetricKey): string | number {
    const [m, y] = period.split('.');
    const f = fin.find(r => r.month===m && r.year===y);
    const u = fun.find(r => r.month===m && r.year===y);

    const convML = u && u.leads ? Math.round((u.meetings/u.leads)*100) : 0;
    const convSL = u && u.leads ? Math.round((u.sales/u.leads)*100) : 0;
    const convSM = u && u.meetings ? Math.round((u.sales/u.meetings)*100) : 0;
    const newRev = u ? Math.round(u.sales * u.avgCheck) : 0;
    const otherRev = f ? Math.max(0, (f.revenue||0) - newRev) : 0;

    switch (key) {
      case 'revenue':       return f ? fmt(f.revenue) : '—';
      case 'rent':          return f ? fmt(f.expenses.rent) : '—';
      case 'payroll':       return f ? fmt(f.expenses.payroll) : '—';
      case 'internet':      return f ? fmt(f.expenses.internet) : '—';
      case 'telephony':     return f ? fmt(f.expenses.telephony) : '—';
      case 'admin':         return f ? fmt(f.expenses.admin) : '—';
      case 'royalty':       return f ? fmt(f.expenses.royalty) : '—';
      case 'taxes':         return f ? fmt(f.expenses.taxes) : '—';
      case 'refunds':       return f ? fmt(f.expenses.refunds) : '—';
      case 'accounting':    return f ? fmt(f.expenses.accounting) : '—';
      case 'marketing':     return f ? fmt(f.expenses.marketing) : '—';
      case 'net':           return f ? fmt(f.net) : '—';
      case 'margin':        return f ? f.margin : '—';
      case 'leads':         return u ? u.leads : '—';
      case 'meetings':      return u ? u.meetings : '—';
      case 'sales':         return u ? u.sales : '—';
      case 'convML':        return u ? convML : '—';
      case 'convSL':        return u ? convSL : '—';
      case 'convSM':        return u ? convSM : '—';
      case 'avgCheck':      return u ? fmt(u.avgCheck) : '—';
      case 'newRevenue':    return u ? fmt(newRev) : '—';
      case 'otherRevenue':  return f ? fmt(otherRev) : '—';
      case 'obligations':   return u ? u.obligations : '—';
    }
  }

  function exportCSV(){
    const header: (string|number)[] = ['Показатель', ...periods];
    const rows: (string|number)[][] = [header];
    METRICS
      .filter(m => enabled[m.key])
      .forEach(m => {
        const row: (string|number)[] = [m.label, ...periods.map(p => value(p, m.key))];
        rows.push(row);
      });
    const csvText: string = toCSV(rows);
    downloadCSV(`summary_${business.title || business.id}.csv`, csvText);
  }

  return (
    <div style={card}>
      <div style={rowBetween}>
        <h3 style={{margin:0}}>Сводная таблица</h3>
        {canExport && <button style={btnPrimary} onClick={exportCSV}>Экспорт CSV</button>}
      </div>

      <div style={{display:'flex', flexWrap:'wrap', gap:8, marginBottom:8}}>
        {METRICS.map(m => (
          <label key={m.key} style={chip}>
            <input
              type="checkbox"
              checked={enabled[m.key]}
              onChange={e=>setEnabled({...enabled, [m.key]: e.target.checked})}
            />
            <span>{m.label}</span>
          </label>
        ))}
      </div>

      <div style={{overflowX:'auto'}}>
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
                <td style={tdHead}>{m.label}</td>
                {periods.map(p => <td key={p} style={tdRight}>{value(p, m.key)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* styles */
const card: React.CSSProperties = { background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:12, marginTop:12 };
const rowBetween: React.CSSProperties = { display:'flex', alignItems:'center', justifyContent:'space-between' };
const btnPrimary: React.CSSProperties = { padding:'8px 12px', borderRadius:10, border:'1px solid #111', background:'#111', color:'#fff', cursor:'pointer' };
const chip: React.CSSProperties = { display:'inline-flex', alignItems:'center', gap:6, border:'1px solid #e5e7eb', borderRadius:999, padding:'4px 8px', fontSize:12, background:'#fff' };
const table: React.CSSProperties = { width:'100%', borderCollapse:'collapse', fontSize:14 };
const th: React.CSSProperties = { border:'1px solid #e5e7eb', padding:'6px 8px', background:'#f9fafb', textAlign:'right' as const };
const tdRight: React.CSSProperties = { border:'1px solid #e5e7eb', padding:'6px 8px', textAlign:'right' as const };
const tdHead: React.CSSProperties = { border:'1px solid #e5e7eb', padding:'6px 8px', fontWeight:600, whiteSpace:'nowrap' };
