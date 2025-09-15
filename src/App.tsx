// ДОБАВЛЕНО: маршрут #/funnel/:id и кнопка перехода из карточки бизнеса

import React from 'react';
import { AuthProvider, LoginScreen, useAuth } from './AuthGate';
import { roleTitle } from './roles';
import BusinessList from './business/ui/BusinessList';
import BusinessPool from './business/ui/BusinessPool';
import * as bizRepo from './business/repo.local';
import { Business } from './business/types';
import FinancialsCard from './financials/ui/FinancialsCard';
import FunnelCard from './funnel/ui/FunnelCard';

/* ───────────── Hash-роутер ───────────── */
type Route =
  | { name: 'home' }
  | { name: 'pool' }
  | { name: 'business'; id: string }
  | { name: 'financials'; id: string }
  | { name: 'funnel'; id: string };

function parseHash(): Route {
  const h = (location.hash || '').replace(/^#/, '');
  const [a, b] = h.split('/').filter(Boolean);
  if (!a) return { name: 'home' };
  if (a === 'pool') return { name: 'pool' };
  if (a === 'business' && b) return { name: 'business', id: b };
  if (a === 'financials' && b) return { name: 'financials', id: b };
  if (a === 'funnel' && b) return { name: 'funnel', id: b };
  return { name: 'home' };
}
function useHashRoute(): [Route] {
  const [route, setRoute] = React.useState<Route>(()=>parseHash());
  React.useEffect(()=>{
    const on = () => setRoute(parseHash());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return [route];
}

/* ───────────── Карточка бизнеса ───────────── */
function BusinessCardScreen({ id }: { id: string }) {
  const { perms } = useAuth();
  const [b, setB] = React.useState<Business | null>(null);
  const [loading, setLoading] = React.useState(true);

  async function load() {
    setLoading(true);
    try { setB(await bizRepo.get(id)); }
    finally { setLoading(false); }
  }
  React.useEffect(()=>{ load(); }, [id]);

  async function save(patch: Partial<Business>) {
    if (!perms?.editBusiness){ alert('Нет прав на редактирование'); return; }
    const next = await bizRepo.update(id, patch);
    setB(next);
  }

  async function unassign() {
    if (!perms?.assignBusinesses){ alert('Нет прав'); return; }
    await bizRepo.assign(id, null);
    await load();
  }

  if (loading) return <div style={{padding:12}}>Загрузка…</div>;
  if (!b) return <div style={{padding:12, color:'#b91c1c'}}>Бизнес не найден</div>;

  return (
    <div style={card}>
      <h3 style={{marginTop:0}}>Карточка бизнеса</h3>
      <div style={grid2}>
        <Field label="Название"><input style={inp} value={b.title} onChange={e=>save({title:e.target.value})} disabled={!perms?.editBusiness} /></Field>
        <Field label="Город"><input style={inp} value={b.city} onChange={e=>save({city:e.target.value})} disabled={!perms?.editBusiness} /></Field>
        <Field label="Направление" span2><input style={inp} value={b.direction} onChange={e=>save({direction:e.target.value})} disabled={!perms?.editBusiness} /></Field>
        <Field label="Тип">
          <select style={inp} value={b.kind} onChange={e=>save({kind: e.target.value as any})} disabled={!perms?.editBusiness}>
            <option value="own">Собственный</option>
            <option value="franchise">Франшизный</option>
          </select>
        </Field>
        <Field label="Валюта">
          <select style={inp} value={b.currency} onChange={e=>save({currency: e.target.value as any})} disabled={!perms?.editBusiness}>
            <option value="RUB">₽ RUB</option>
            <option value="BYN">Br BYN</option>
            <option value="KZT">₸ KZT</option>
          </select>
        </Field>
        <Field label="Контакты собственника" span2>
          <input style={inp} value={b.ownerContact} onChange={e=>save({ownerContact:e.target.value})} disabled={!perms?.editBusiness} />
        </Field>
        <Field label="Статус" span2>
          <select style={inp} value={b.status} onChange={e=>save({status: e.target.value as any})} disabled={!perms?.editBusiness}>
            {['new','assigned','primary_collected','price_estimated','price_agreed','buyers_base_formed','meetings','approved_buyer','buyer_has_money','signing','sold','archived']
              .map(s=><option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
      </div>

      <div style={{display:'flex', gap:8, marginTop:8, flexWrap:'wrap'}}>
        <a style={btnGhost as any} href="#/">К списку</a>
        {perms?.assignBusinesses && (
          <button style={btnDanger} onClick={unassign}>Снять ответственного (в биржу)</button>
        )}
        {perms?.viewFinancials && (
          <a style={btnPrimary as any} href={`#/financials/${b.id}`}>Финансы</a>
        )}
        {perms?.viewFunnel && (
          <a style={btnPrimary as any} href={`#/funnel/${b.id}`}>Воронка</a>
        )}
      </div>
    </div>
  );
}

/* ───────────── Экран финансов ───────────── */
function FinancialsScreen({ id }: { id: string }) {
  const { perms } = useAuth();
  const [biz, setBiz] = React.useState<Business | null>(null);

  React.useEffect(()=>{ bizRepo.get(id).then(setBiz); }, [id]);

  if (!perms?.viewFinancials) return <div style={{padding:12, color:'#b91c1c'}}>Нет прав доступа</div>;
  if (!biz) return <div style={{padding:12}}>Загрузка…</div>;

  return (
    <div>
      <div style={rowBetween}>
        <h2 style={{margin:0}}>Финансы: {biz.title || 'Без названия'}</h2>
        <a style={btnGhost as any} href={`#/business/${biz.id}`}>К карточке бизнеса</a>
      </div>
      <FinancialsCard businessId={biz.id} canEdit={!!perms.editFinancials}/>
    </div>
  );
}

/* ───────────── Экран воронки ───────────── */
function FunnelScreen({ id }: { id: string }) {
  const { perms } = useAuth();
  const [biz, setBiz] = React.useState<Business | null>(null);

  React.useEffect(()=>{ bizRepo.get(id).then(setBiz); }, [id]);

  if (!perms?.viewFunnel) return <div style={{padding:12, color:'#b91c1c'}}>Нет прав доступа</div>;
  if (!biz) return <div style={{padding:12}}>Загрузка…</div>;

  return (
    <div>
      <div style={rowBetween}>
        <h2 style={{margin:0}}>Воронка: {biz.title || 'Без названия'}</h2>
        <a style={btnGhost as any} href={`#/business/${biz.id}`}>К карточке бизнеса</a>
      </div>
      <FunnelCard businessId={biz.id} canEdit={!!perms.editFunnel}/>
    </div>
  );
}

/* ───────────── Навбар ───────────── */
function NavBar(){
  const { user, logout } = useAuth();
  return (
    <div style={topbar}>
      <div style={{display:'flex', gap:8, alignItems:'center'}}>
        <a href="#/" style={link}>Бизнесы</a>
        <a href="#/pool" style={link}>Биржа</a>
      </div>
      <div style={{display:'flex', gap:12, alignItems:'center'}}>
        <span style={{fontSize:12, color:'#6b7280'}}>{user?.name} · {user ? roleTitle(user.role) : ''}</span>
        <button style={btnGhost} onClick={logout}>Выйти</button>
      </div>
    </div>
  );
}

/* ───────────── Оболочка ───────────── */
function Shell(){
  const { user, perms } = useAuth();
  const [route] = useHashRoute();

  if (!user || !perms) return <LoginScreen />;

  return (
    <div style={page}>
      <NavBar />
      {route.name === 'home' && <BusinessList />}
      {route.name === 'pool' && <BusinessPool />}
      {route.name === 'business' && <BusinessCardScreen id={route.id} />}
      {route.name === 'financials' && <FinancialsScreen id={route.id} />}
      {route.name === 'funnel' && <FunnelScreen id={route.id} />}
    </div>
  );
}

export default function App(){
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}

/* ───────────── Утилиты/стили ───────────── */
function Field(p:{label:string; children:React.ReactNode; span2?:boolean}){
  return <label style={{display:'block', gridColumn: p.span2?'1 / span 2': undefined}}>
    <div style={{fontSize:12, color:'#6b7280', margin:'8px 0 4px'}}>{p.label}</div>
    {p.children}
  </label>;
}

const page: React.CSSProperties = { padding:'24px', fontFamily:'system-ui, -apple-system, Segoe UI, Roboto, sans-serif', maxWidth:1024, margin:'0 auto' };
const topbar: React.CSSProperties = { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 12px', border:'1px solid #e5e7eb', borderRadius:12, background:'#fff', marginBottom:12 };
const link: React.CSSProperties = { textDecoration:'none', color:'#111', padding:'6px 10px', border:'1px solid #e5e7eb', borderRadius:8 };
const rowBetween: React.CSSProperties = { display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:4, marginBottom:8 };
const card: React.CSSProperties = { background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:12, margin:'12px 0' };
const grid2: React.CSSProperties = { display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 };
const inp: React.CSSProperties = { width:'100%', padding:'10px 12px', border:'1px solid #cfd3d8', borderRadius:10, fontSize:14, outline:'none' };
const btnGhost: React.CSSProperties = { padding:'8px 12px', borderRadius:10, border:'1px solid #cfd3d8', background:'#fff', cursor:'pointer' };
const btnPrimary: React.CSSProperties = { padding:'8px 12px', borderRadius:10, border:'1px solid #111', background:'#111', color:'#fff', cursor:'pointer' };
const btnDanger: React.CSSProperties = { padding:'8px 12px', borderRadius:10, border:'1px solid #dc2626', background:'#fef2f2', color:'#b91c1c', cursor:'pointer' };
