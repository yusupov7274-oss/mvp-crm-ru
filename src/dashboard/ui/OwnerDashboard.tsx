import React from 'react';
import * as finRepo from '../../financials/repo.local';
import * as funRepo from '../../funnel/repo.local';
import { FinancialRecord } from '../../financials/types';
import { FunnelRecord } from '../../funnel/types';
import * as bizRepo from '../../business/repo.local';
import { Business } from '../../business/types';
import { getUserById } from '../../UserStore';

type Period = { month: string | null; year: string | null }; // null => все периоды

function useData(period: Period){
  const [financials, setFinancials] = React.useState<FinancialRecord[]>([]);
  const [funnels, setFunnels] = React.useState<FunnelRecord[]>([]);
  const [businessMap, setBusinessMap] = React.useState<Record<string, Business>>({});
  const [loading, setLoading] = React.useState(true);

  React.useEffect(()=>{
    let isCancelled = false;
    async function loadAll(){
      setLoading(true);
      try{
        // берём все финансы/воронки из LS и фильтруем на клиенте
        const allFin = await finRepo.listByBusiness(''); // хак? вернёт пусто
      } catch{}
      finally{}
    }
  },[]);

  // Т.к. finRepo.listByBusiness требует businessId, заберём всё иначе:
  // Сканируем все бизнесы, затем подтянем по id их записи.
  React.useEffect(()=>{
    let alive = true;
    async function load(){
      setLoading(true);
      try{
        // Получаем ВСЕ бизнесы из репозитория
        const ids = await bizRepo.listIds(); // добавим вспом-метод внизу файла (fallback)
        // Если listIds отсутствует — альтернативный путь:
        let businessIds = ids;
        if (!Array.isArray(ids) || ids.length === 0) {
          // запасной вариант: пройдёмся по известным источникам и соберём id
          const finKeys = JSON.parse(localStorage.getItem('crm_financials_v1') || '[]').map((x:any)=>x.businessId);
          const funKeys = JSON.parse(localStorage.getItem('crm_funnel_v1') || '[]').map((x:any)=>x.businessId);
          businessIds = Array.from(new Set([...(finKeys||[]), ...(funKeys||[])].filter(Boolean)));
        }

        // Загружаем по каждому бизнесу финансы/воронки (локально фильтруем по периоду)
        const [finAll, funAll, bizPairs] = await Promise.all([
          Promise.all(businessIds.map(id => finRepo.listByBusiness(id))).then(a=>a.flat()),
          Promise.all(businessIds.map(id => funRepo.listByBusiness(id))).then(a=>a.flat()),
          Promise.all(businessIds.map(async id => {
            try{ const b = await bizRepo.get(id); return b ? [id, b] as const : null; } catch{ return null; }
          })).then(arr => Object.fromEntries(arr.filter(Boolean) as any))
        ]);

        const fin = finAll.filter(r => {
          if (!period.month || !period.year) return true;
          return r.month === period.month && r.year === period.year;
        });
        const fun = funAll.filter(r => {
          if (!period.month || !period.year) return true;
          return r.month === period.month && r.year === period.year;
        });

        if (!alive) return;
        setFinancials(fin);
        setFunnels(fun);
        setBusinessMap(bizPairs as any);
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return ()=>{ alive = false; };
  }, [period.month, period.year]);

  return { financials, funnels, businessMap, loading };
}

function fmt(n:number){ return Number(n||0).toLocaleString('ru-RU', { maximumFractionDigits: 0 }); }
function sum(arr:number[]){ return arr.reduce((a,b)=>a+Number(b||0),0); }

function MonthYearPicker(p:{value:{month:string|null;year:string|null}, onChange:(m:string|null,y:string|null)=>void}){
  const val = (p.value.month && p.value.year) ? `${p.value.year}-${String(p.value.month).padStart(2,'0')}` : '';
  return (
    <div style={{display:'flex', gap:8, alignItems:'end', flexWrap:'wrap'}}>
      <label style={{fontSize:12, color:'#6b7280'}}>
        Период (месяц/год)
        <input
          type="month"
          style={inp}
          value={val}
          onChange={e=>{
            const v = e.target.value;
            if (!v) { p.onChange(null, null); return; }
            const [y,m] = v.split('-');
            p.onChange(m,y);
          }}
        />
      </label>
      <label style={{fontSize:12, color:'#374151', display:'flex', alignItems:'center', gap:8}}>
        <input
          type="checkbox"
          checked={!p.value.month || !p.value.year}
          onChange={e=> e.target.checked ? p.onChange(null, null) : null}
        />
        Все периоды
      </label>
    </div>
  );
}

export default function OwnerDashboard(){
  const [period, setPeriod] = React.useState<Period>({month:null, year:null});
  const { financials, funnels, businessMap, loading } = useData(period);

  // агрегаты по финансам
  const revenue = sum(financials.map(f=>f.revenue));
  const royalty = sum(financials.map(f=>f.expenses.royalty));
  const expensesTotal = sum(financials.map(f => Object.values(f.expenses).reduce((a,b)=>a+Number(b||0),0)));
  const net = sum(financials.map(f=>f.net));
  const margin = revenue>0 ? Math.round((net/revenue)*100) : 0;

  // агрегаты по воронке
  const leads = sum(funnels.map(u=>u.leads));
  const meetings = sum(funnels.map(u=>u.meetings));
  const sales = sum(funnels.map(u=>u.sales));
  const newRevenue = sum(funnels.map(u=>Math.round(u.sales * u.avgCheck)));

  // рейтинг менеджеров (по назначенным бизнесам)
  type Row = { managerId: string|null; managerName: string; newRevenue: number; net: number; businesses: number };
  const byManager = new Map<string|null, Row>();
  function touch(id: string|null){
    if (!byManager.has(id)) {
      const user = id ? getUserById(id) : null;
      byManager.set(id, { managerId:id, managerName: user?.name || '— без менеджера —', newRevenue:0, net:0, businesses:0 });
    }
    return byManager.get(id)!;
  }

  const businessIdsFromData = Array.from(new Set([
    ...financials.map(f=>f.businessId),
    ...funnels.map(u=>u.businessId),
  ]));

  businessIdsFromData.forEach(bid=>{
    const b = businessMap[bid];
    const mid = (b as any)?.assignedUserId || null;
    const row = touch(mid);
    row.businesses += 1;

    // net по этому бизнесу и периоду
    const netSum = financials.filter(f=>f.businessId===bid).reduce((a,f)=>a+f.net,0);
    const newRevSum = funnels.filter(u=>u.businessId===bid).reduce((a,u)=>a + Math.round(u.sales*u.avgCheck), 0);
    row.net += netSum;
    row.newRevenue += newRevSum;
  });

  const leaderboard = Array.from(byManager.values())
    .sort((a,b)=> b.newRevenue - a.newRevenue)
    .slice(0,20);

  return (
    <div style={page}>
      <div style={rowBetween}>
        <h2 style={{margin:0}}>Дашборд владельца</h2>
        <MonthYearPicker value={period} onChange={(m,y)=>setPeriod({month:m, year:y})} />
      </div>

      {loading ? (
        <div style={{padding:12}}>Загрузка…</div>
      ) : (
        <>
          <div style={grid4}>
            <StatCard title="Выручка" value={`${fmt(revenue)} ₽`} />
            <StatCard title="Расходы (вкл. роялти)" value={`${fmt(expensesTotal)} ₽`} />
            <StatCard title="Чистая прибыль" value={`${fmt(net)} ₽`} />
            <StatCard title="Рентабельность" value={`${margin} %`} />
            <StatCard title="Роялти" value={`${fmt(royalty)} ₽`} />
            <StatCard title="Лиды" value={fmt(leads)} />
            <StatCard title="Встречи" value={fmt(meetings)} />
            <StatCard title="Продажи" value={fmt(sales)} />
            <StatCard title="Выручка новых продаж" value={`${fmt(newRevenue)} ₽`} span2 />
          </div>

          <div style={card}>
            <h3 style={{marginTop:0}}>Топ менеджеров (по выручке новых продаж)</h3>
            <div style={{overflowX:'auto'}}>
              <table style={table}>
                <thead>
                  <tr>
                    <th style={thLeft}>Менеджер</th>
                    <th style={thRight}>Бизнесов</th>
                    <th style={thRight}>Выручка новых продаж</th>
                    <th style={thRight}>Чистая прибыль</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map(row=>(
                    <tr key={row.managerId ?? 'none'}>
                      <td style={tdLeft}>{row.managerName}</td>
                      <td style={tdRight}>{row.businesses}</td>
                      <td style={tdRight}>{fmt(row.newRevenue)} ₽</td>
                      <td style={tdRight}>{fmt(row.net)} ₽</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* Примитивные карточки и стили */
function StatCard(p:{title:string; value:string|number; span2?:boolean}){
  return (
    <div style={{...card, ...(p.span2?{gridColumn:'span 2'}:{})}}>
      <div style={{fontSize:12, color:'#6b7280'}}>{p.title}</div>
      <div style={{fontSize:22, fontWeight:700}}>{p.value}</div>
    </div>
  );
}

const page: React.CSSProperties = { padding:'12px 0' };
const rowBetween: React.CSSProperties = { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 };
const grid4: React.CSSProperties = { display:'grid', gridTemplateColumns:'repeat(4, minmax(0,1fr))', gap:8, marginBottom:12 };
const card: React.CSSProperties = { background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:12 };

const table: React.CSSProperties = { width:'100%', borderCollapse:'collapse', fontSize:14 };
const thLeft: React.CSSProperties = { border:'1px solid #e5e7eb', padding:'6px 8px', background:'#f9fafb', textAlign:'left' };
const thRight: React.CSSProperties = { border:'1px solid #e5e7eb', padding:'6px 8px', background:'#f9fafb', textAlign:'right' };
const tdLeft: React.CSSProperties = { border:'1px solid #e5e7eb', padding:'6px 8px', textAlign:'left' };
const tdRight: React.CSSProperties = { border:'1px solid #e5e7eb', padding:'6px 8px', textAlign:'right' };

const inp: React.CSSProperties = { width:'100%', padding:'8px 10px', border:'1px solid #cfd3d8', borderRadius:10, fontSize:14, outline:'none' };

/**
 * Вспомогательный метод: если в bizRepo нет listIds(),
 * можно добавить его в repo.local.ts, возвращающий массив id всех бизнесов.
 * Здесь мыfallback-им на чтение ключей из localStorage.
 */
