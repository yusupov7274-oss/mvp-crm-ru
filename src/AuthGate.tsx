// АУТЕНТИФИКАЦИЯ ПО ЛОГИНУ/ПАРОЛЮ + КОНТЕКСТ РОЛЕЙ. Управление пользователями вынесем в OwnerPanel.

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Role, roleTitle, Permissions } from './roles';
import { authenticate, listUsers, permsForUser, UserRecord } from './UserStore';

type Session = { id: string; name: string; role: Role };

type AuthCtx = {
  user: Session | null;
  perms: Permissions | null;
  login: (login: string, password: string) => string | null; // null = успех, иначе текст ошибки
  logout: () => void;
};

const AuthContext = createContext<AuthCtx>({ user:null, perms:null, login:()=> 'not ready', logout:()=>{} });

const SKEY = 'crm_session_v1';

export function AuthProvider({ children }: { children: React.ReactNode }){
  const [user, setUser] = useState<Session | null>(() => {
    try { const raw = localStorage.getItem(SKEY); return raw ? JSON.parse(raw) as Session : null; } catch { return null; }
  });

  const perms = useMemo(()=>{
    if (!user) return null;
    const full = listUsers().find(u=>u.id===user.id);
    return full ? permsForUser(full) : null;
  }, [user]);

  const login = (login: string, password: string) => {
    const u = authenticate(login, password);
    if (!u) return 'Неверный логин или пароль';
    const sess: Session = { id: u.id, name: u.name, role: u.role };
    setUser(sess);
    localStorage.setItem(SKEY, JSON.stringify(sess));
    return null;
  };

  const logout = () => { setUser(null); localStorage.removeItem(SKEY); };

  return <AuthContext.Provider value={{ user, perms, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth(){ return useContext(AuthContext); }

export function LoginScreen(){
  const { login } = useAuth();
  const [l, setL] = useState('boss');       // демо-логин
  const [p, setP] = useState('boss123');    // демо-пароль
  const [err, setErr] = useState<string | null>(null);

  function submit(e: React.FormEvent){
    e.preventDefault();
    const res = login(l, p);
    setErr(res);
  }

  return (
    <div style={wrap}>
      <form onSubmit={submit} style={card}>
        <h2 style={{ marginTop: 0 }}>Вход</h2>
        <label style={lbl}>Логин<input style={inp} value={l} onChange={e=>setL(e.target.value)} autoFocus /></label>
        <label style={lbl}>Пароль<input style={inp} type="password" value={p} onChange={e=>setP(e.target.value)} /></label>
        {err && <div style={{ color:'#b91c1c', fontSize:12, marginBottom:8 }}>{err}</div>}
        <button type="submit" style={btnPrimary}>Войти</button>
        <div style={{ fontSize:12, color:'#6b7280', marginTop:8 }}>
          Демо-владелец: <code>boss / boss123</code>. Смените в панели пользователей.
        </div>
      </form>
    </div>
  );
}

/* стили мини */
const wrap: React.CSSProperties = { minHeight:'100vh', display:'grid', placeItems:'center', background:'#f7f7f8' };
const card: React.CSSProperties = { width:420, background:'#fff', border:'1px solid #e5e7eb', borderRadius:16, padding:16, boxShadow:'0 6px 30px rgba(0,0,0,0.06)' };
const lbl: React.CSSProperties = { display:'block', fontSize:12, color:'#6b7280', marginBottom:8 };
const inp: React.CSSProperties = { width:'100%', padding:'10px 12px', border:'1px solid #cfd3d8', borderRadius:10, fontSize:14, outline:'none' };
const btnPrimary: React.CSSProperties = { marginTop:12, width:'100%', padding:'12px', borderRadius:10, border:'1px solid #111', background:'#111', color:'#fff', cursor:'pointer' };
