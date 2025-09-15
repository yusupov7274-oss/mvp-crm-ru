// UI ввода финансов по месяцам с автосчётом роялти/ЧП/маржи

import React from 'react';
import { FinancialRecord } from '../types';
import * as repo from '../repo.local';
import { newRecord, recalc } from '../calc';

export default function FinancialsCard({ businessId, canEdit }: { businessId: string; canEdit: boolean }) {
  const [items, setItems] = React.useState<FinancialRecord[]>([]);
  const [loading, setLoading] = React.useState(true);

  async function load(){
    setLoading(true);
    try{ setItems(await repo.listByBusiness(businessId)); }
    finally{ setLoading(false); }
  }
  React.useEffect(()=>{ load(); }, [businessId]);

  async function addPeriod(){
    const base = newRecord(businessId);
    const saved = await repo.upsert(base);
    setItems(prev => [...prev, saved]);
  }

  async function patch(id: string, p: Partial<FinancialRecord>){
    if (!canEdit) return;
    const cur = items.find(x=>x.id===id)!;
    const next = recalc({ ...cur, ...p } as FinancialRecord);
    const saved = await repo.upsert(next);
    setItems(prev => prev.map(x=> x.id===id ? saved : x));
  }

  async function patchExpense(id: string, key: keyof FinancialRecord['expenses'], val: number){
    if (!canEdit) return;
    const cur = items.find(x=>x.id===id)!;
    const next: FinancialRecord = { ...cur, expenses: { ...cur.expenses, [key]: Number(val||0) } as any };
    const saved = await repo.upsert(recalc(next));
    setItems(prev => prev.map(x=> x.id===id ? saved : x));
  }

  async function del(id: string){
    if (!canEdit) return;
    if (!confirm('Удалить период?')) return;
    await repo.remove(id);
    setItems(prev => prev.filter(x=>x.id!==id));
  }

  return (
    <div style={card}>
      <div style={rowBetween}>
        <h3 style={{margin:0}}>Финансы</h3>
        {canEdit && <button style={btnPrimary} onClick={addPeriod}>Добавить период</button>}
      </div>

      {loading ? (
        <div style={{padding:12}}>Загрузка…</div>
      ) : items.length === 0 ? (
        <div style={{padding:12, color:'#6b7280'}}>Нет данных. Добавьте первый период.</div>
      ) : (
        <div style={{display:'grid', gap:10}}>
          {items.map(r=>(
            <div key={r.id} style={panel}>
              <div style={rowBetween}>
                <MonthYear value={{month:r.month,year:r.year}} onChange={(m,y)=>patch(r.id,{month:m,year:y})} disabled={!canEdit}/>
                <button style={btnDanger} onClick={()=>del(r.id)} disabled={!canEdit}>Удалить</button>
              </div>

              <div style={grid3}>
                <Field label="Выручка, ₽">
                  <input style={inp} type="number" value={r.revenue} onChange={e=>patch(r.id,{revenue:num(e)})} disabled={!canEdit}/>
                </Field>
                <Field label="Возвраты, ₽">
                  <input style={inp} type="number" value={r.expenses.refunds} onChange={e=>patchExpense(r.id,'refunds',num(e))} disabled={!canEdit}/>
                </Field>
                <Field label="Процент роялти, %">
                  <input style={inp} type="number" value={r.royaltyPercent} onChange={e=>patch(r.id,{royaltyPercent:num(e)})} disabled={!canEdit}/>
                </Field>
                <label style={{fontSize:12, color:'#374151', display:'flex', gap:8, alignItems:'center'}}>
                  <input type="checkbox" checked={r.royaltyIncludeRefunds} onChange={e=>patch(r.id,{royaltyIncludeRefunds:e.target.checked})} disabled={!canEdit}/>
                  Считать роялти с учётом возвратов (выручка − возвраты)
                </label>
              </div>

              <h4 style={{margin:'8px 0 4px'}}>Расходы</h4>
              <div style={grid3}>
                <Num label="Аренда"      v={r.expenses.rent}        onChange={v=>patchExpense(r.id,'rent',v)}        dis={!canEdit}/>
                <Num label="ФОТ"         v={r.expenses.payroll}     onChange={v=>patchExpense(r.id,'payroll',v)}     dis={!canEdit}/>
                <Num label="Интернет"    v={r.expenses.internet}    onChange={v=>patchExpense(r.id,'internet',v)}    dis={!canEdit}/>
                <Num label="Телефония"   v={r.expenses.telephony}   onChange={v=>patchExpense(r.id,'telephony',v)}   dis={!canEdit}/>
                <Num label="Адм. расходы"v={r.expenses.admin}       onChange={v=>patchExpense(r.id,'admin',v)}       dis={!canEdit}/>
                <Num label="Налоги"      v={r.expenses.taxes}       onChange={v=>patchExpense(r.id,'taxes',v)}       dis={!canEdit}/>
                <Num label="Бухгалтерия" v={r.expenses.accounting}  onChange={v=>patchExpense(r.id,'accounting',v)}  dis={!canEdit}/>
                <Num label="Маркетинг"   v={r.expenses.marketing}   onChange={v=>patchExpense(r.id,'marketing',v)}   dis={!canEdit}/>
                <div/>
              </div>

              <div style={totals}>
                <Badge>Роялти: <b>{fmt(r.expenses.royalty)}</b> ₽</Badge>
                <Badge>Чистая прибыль: <b>{fmt(r.net)}</b> ₽</Badge>
                <Badge>Рентабельность: <b>{r.margin}%</b></Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* элементы */
function Field(p:{label:string; children:React.ReactNode}){
  return <label style={{display:'block'}}>
    <div style={{fontSize:12, color:'#6b7280', margin:'6px 0 4px'}}>{p.label}</div>
    {p.children}
  </label>;
}
function Num(p:{label:string; v:number; onChange:(v:number)=>void; dis?:boolean}){
  return <Field label={p.label}>
    <input style={inp} type="number" value={p.v} onChange={e=>p.onChange(num(e))} disabled={p.dis}/>
  </Field>;
}
function MonthYear(p:{value:{month:string; year:string}; onChange:(m:string,y:string)=>void; disabled?:boolean}){
  const val = `${p.value.year}-${(p.value.month||'').toString().padStart(2,'0')}`;
  return (
    <label style={{fontSize:12, color:'#6b7280'}}>
      Период (месяц/год)
      <input style={inp} type="month" value={val} onChange={(e)=>{
        const [y,m] = e.target.value.split('-'); p.onChange(m,y);
      }} disabled={p.disabled}/>
    </label>
  );
}

/* утилиты/стили */
function num(e: React.ChangeEvent<HTMLInputElement>){ return Number(e.target.value || 0); }
function fmt(n:number){ return Number(n||0).toLocaleString('ru-RU', { maximumFractionDigits: 0 }); }

const card: React.CSSProperties = { background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:12, marginTop:12 };
const panel: React.CSSProperties = { border:'1px solid #eee', borderRadius:10, padding:10, background:'#fafafa' };
const rowBetween: React.CSSProperties = { display:'flex', alignItems:'center', justifyContent:'space-between' };
const grid3: React.CSSProperties = { display:'grid', gridTemplateColumns:'repeat(3, minmax(0,1fr))', gap:8, alignItems:'end' };
const inp: React.CSSProperties = { width:'100%', padding:'8px 10px', border:'1px solid #cfd3d8', borderRadius:10, fontSize:14, outline:'none' };
const btnPrimary: React.CSSProperties = { padding:'8px 12px', borderRadius:10, border:'1px solid #111', background:'#111', color:'#fff', cursor:'pointer' };
const btnDanger: React.CSSProperties = { padding:'8px 12px', borderRadius:10, border:'1px solid #dc2626', background:'#fef2f2', color:'#b91c1c', cursor:'pointer' };
const totals: React.CSSProperties = { display:'flex', flexWrap:'wrap', gap:8, marginTop:8 };
function Badge(p:{children:React.ReactNode}){ return <span style={{fontSize:12, background:'#fff', border:'1px solid #e5e7eb', padding:'6px 8px', borderRadius:8}}>{p.children}</span>; }
