// Биржа бизнесов (без ответственного). Владелец может назначать менеджеров.

import React from 'react';
import * as repo from '../repo.local';
import { Business } from '../types';
import { listUsers, updateUser, UserRecord } from '../../UserStore';
import { useAuth } from '../../AuthGate';

export default function BusinessPool(){
  const { perms } = useAuth();
  const [items, setItems] = React.useState<Business[]>([]);
  const [managers, setManagers] = React.useState<UserRecord[]>([]);
  const [assignTo, setAssignTo] = React.useState<string>(''); // выбранный менеджер

  async function load(){
    const pool = await repo.listPool();
    setItems(pool);
    const us = listUsers().filter(u => u.role !== 'owner'); // все кроме владельца
    setManagers(us);
    if (us[0]) setAssignTo(us[0].id);
  }
  React.useEffect(()=>{ load(); }, []);

  async function assign(businessId: string){
    if (!perms?.assignBusinesses){ alert('Нет прав'); return; }
    await repo.assign(businessId, assignTo || null);
    // (опционально: добавим бизнес id в область видимости менеджера)
    const u = managers.find(m=>m.id===assignTo);
    if (u){
      const scope = new Set([...(u.businessIds||[]), businessId]);
      updateUser(u.id, { businessIds: Array.from(scope) } as any);
    }
    await load();
  }

  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <h2 style={{margin:0}}>Биржа бизнесов</h2>
        <div style={{display:'flex', gap:8, alignItems:'center'}}>
          <div style={{fontSize:12, color:'#6b7280'}}>Назначить на:</div>
          <select style={inp} value={assignTo} onChange={e=>setAssignTo(e.target.value)}>
            {managers.map(m=> (<option key={m.id} value={m.id}>{m.name} · {m.login}</option>))}
          </select>
        </div>
      </div>

      {items.length === 0 ? (
        <div style={{padding:12, color:'#6b7280'}}>Пусто: все бизнесы уже распределены.</div>
      ) : (
        <div style={{display:'grid', gap:8, marginTop:8}}>
          {items.map(b=>(
            <div key={b.id} style={cardRow}>
              <div>
                <div style={{fontWeight:600}}>{b.title || 'Без названия'}</div>
                <div style={{fontSize:12, color:'#6b7280'}}>
                  {b.city || '—'} · {b.direction || '—'} · {b.kind==='franchise'?'Франшиза':'Собственный'} · {b.currency}
                </div>
              </div>
              <div style={{display:'flex', gap:8}}>
                <button style={btnGhost} onClick={()=> location.hash = `#/business/${b.id}`}>Открыть</button>
                <button style={btnPrimary} onClick={()=>assign(b.id)}>Назначить</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* стили */
const cardRow: React.CSSProperties = { background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:12, display:'flex', justifyContent:'space-between', alignItems:'center' };
const inp: React.CSSProperties = { padding:'8px 10px', border:'1px solid #cfd3d8', borderRadius:10, fontSize:14, outline:'none' };
const btnGhost: React.CSSProperties = { padding:'8px 12px', borderRadius:10, border:'1px solid #cfd3d8', background:'#fff', cursor:'pointer' };
const btnPrimary: React.CSSProperties = { padding:'10px 14px', borderRadius:10, border:'1px solid #111', background:'#111', color:'#fff', cursor:'pointer' };
