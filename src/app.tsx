import React from 'react';
import BusinessCard from './BusinessCard';

export default function App() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>CRM для продажи бизнесов</h1>
      <p>Это первая версия — пока только карточка бизнеса.</p>

      <BusinessCard />
    </div>
  );
}
