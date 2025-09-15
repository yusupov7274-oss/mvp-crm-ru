// Список бизнесов текущего пользователя (владелец видит все, менеджер — свои)

import React from 'react';
import { useAuth } from '../../AuthGate';
import { roleTitle } from '../../roles';
import * as repo from '../repo.local';
import { Business } from '../types';

export default function BusinessList() {
  const { user, perms } = useAuth();
  const [items, setItems] = React.useState<Business[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [draft, setDraft] = React.useState({
    title: '', city: '', direction: '', kind: 'own' as 'own'|'franchise', currency: 'RUB' as 'RUB'|'BYN'|'KZT',
    ownerContact: '',
  });

  async function load() {
    setLoading(true);
    try {
      if (!user) return;
      const data = perms?.viewAllBusinesses
        ? await repo.listAll()
        : await repo.listByResponsible(user.id);
      setItems(data);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(()=>{ load(); }, []);

  async function createBusiness() {
    if (!perms?.editBusiness) { alert('Нет прав'); return; }
    const b = await repo.create({
      title: draft.title.trim() || 'Без названия',
      city: draft.city.trim(),
      direction: draft.direction.trim(),
      kind: draft.kind,
      currency: draft.currency,
      ownerContact: draft.ownerContact.trim(),
      responsibleId: user!.id, // создатель сразу ответственный
    });
    setDraft({ title:'', city:'', direction:'', kind:'own', currency:'RUB', ownerContact:'' });
    setItems([b, ...items]);
    location.hash = `#/business/${b.id}`;
  }

  async function del(id: string) {
    if (!perms?.editBusiness) { alert('Нет прав'); return; }
    if (!confirm('Удалить бизнес?')) return;
    await repo.remove(id);
    setItems(items.filter(x=>x.id!==id));
  }

  return (
    <div>
      <div style={rowBetween}>
        <h2 style={{margin:0}}>Мои бизнесы</h2>
        <div style={{fontSize:12,color:'#6b7280'}}>
          {user?.name} · {user ? roleTitle(user.role) : ''}
        </div>
      </div>

      {perms?.editBusiness && (
        <div style={card}>
          <h3 style={{marginTop:0}}>Новый бизнес</h3>
          <div style={grid2}>
            <Field label="Название"><input style={inp} value={draft.title} onChange={e=>setDraft({...draft, title:e.target.value})} /></Field>
            <Field label="Город"><input style={inp} value={draft.city} onChange={e=>setDraft({...draft, city:e.target.value})} /></Field>
            <Field label="Направление" span2><input style={inp} value={draft.direction} onChange={e=>setDraft({...draft, direction:e.target.value})} /></Field>
            <Field label="Вид">
              <select style={inp} value={draft.kind} onChange={e=>setDraft({...draft, kind: e.target.value as any})}>
                <option value="own">Собственный</option>
                <option value="franchise">Франшизный</option>
              </select>
            </Field>
            <Field label="Валюта">
              <select style={inp} value={draft.currency} onChange={e=>setDraft({...draft, currency: e.target.value as any})}>
                <option value="RUB">₽ RUB</option>
                <option value="BYN">Br BYN</option>
                <option value="KZT">₸ KZT</option>
              </select>
            </Field>
            <Field label="Контакты собственника" span2>
              <input style={inp} value={draft.ownerContact} onChange={e=>setDraft({...draft, ownerContact:e.target.value})} />
            </Field>
          </div>
          <div style={{marginTop:8}}>
            <button style={btnPrimary} onClick={createBusiness}>Создать</button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{padding:12}}>Загрузка…</div>
      ) : items.length === 0 ? (
        <div style={{padding:12, color:'#6b7280'}}>Бизнесов пока нет</div>
      ) : (
        <div style={{display:'grid', gap:8}}>
          {items.map(b => (
            <div key={b.id} style={cardRow}>
              <div>
                <div style={{fontWeight:600}}>{b.title || 'Без названия'}</div>
                <div style={{fontSize:12, color:'#6b7280'}}>
                  {b.city || '—'} · {b.direction || '—'} · {b.kind==='franchise'?'Франшиза':'Собственный'} · {b.currency}
                </div>
              </div>
              <div style={{display:'flex', gap:8}}>
                <button style={btnGhost} onClick={()=> location.hash = `#/business/${b.id}`}>Открыть</button>
                {perms?.editBusiness && <button style={btnDanger} onClick={()=>del(b.id)}>Удалить</button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Field(p:{label:string; children:React.ReactNode; span2?:boolean}){
  return <label style={{display:'block', gridColumn: p.span2?'1 / span 2': undefined}}>
    <div style={{fontSize:12, color:'#6b7280', margin:'8px 0 4px'}}>{p.label}</div>
    {p.children}
  </label>;
}

/* стили */
const card: React.CSSProperties = { background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:12, margin:'12px 0' };
const cardRow: React.CSSProperties = { background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:12, display:'flex', justifyContent:'space-between', alignItems:'center' };
const grid2: React.CSSProperties = { display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 };
const rowBetween: React.CSSProperties = { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 };
const inp: React.CSSProperties = { width:'100%', padding:'10px 12px', border:'1px solid #cfd3d8', borderRadius:10, fontSize:14, outline:'none' };
const btnPrimary: React.CSSProperties = { padding:'10px 14px', borderRadius:10, border:'1px solid #111', background:'#111', color:'#fff', cursor:'pointer' };
const btnGhost: React.CSSProperties = { padding:'8px 12px', borderRadius:10, border:'1px solid #cfd3d8', background:'#fff', cursor:'pointer' };
const btnDanger: React.CSSProperties = { padding:'8px 12px', borderRadius:10, border:'1px solid #dc2626', background:'#fef2f2', color:'#b91c1c', cursor:'pointer' };
