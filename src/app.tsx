import React from 'react';
import BusinessCard from './BusinessCard';

export default function App() {
  return (
    <div style={{ padding: 24, fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif', maxWidth: 960, margin: '0 auto' }}>
      <h1 style={{ marginTop: 8 }}>CRM для продажи бизнесов</h1>
      <p style={{ color: '#666', marginTop: 0 }}>Шаг 1: базовая карточка бизнеса (данные сохраняются в браузере).</p>

      <BusinessCard />
    </div>
  );
}
