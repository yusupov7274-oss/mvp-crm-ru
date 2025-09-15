import React, { useState } from 'react';

export default function BusinessCard() {
  const [title, setTitle] = useState('');
  const [city, setCity] = useState('');
  const [direction, setDirection] = useState('');
  const [kind, setKind] = useState<'own' | 'franchise'>('own');

  return (
    <div style={{ marginTop: '1rem', padding: '1rem', border: '1px solid #ccc', borderRadius: 8 }}>
      <h2>Карточка бизнеса</h2>

      <label>
        Название: <br />
        <input value={title} onChange={e => setTitle(e.target.value)} />
      </label>
      <br /><br />

      <label>
        Город: <br />
        <input value={city} onChange={e => setCity(e.target.value)} />
      </label>
      <br /><br />

      <label>
        Направление: <br />
        <input value={direction} onChange={e => setDirection(e.target.value)} />
      </label>
      <br /><br />

      <div>
        Вид бизнеса: 
        <button 
          onClick={() => setKind('own')} 
          style={{ marginLeft: 8, background: kind === 'own' ? '#000' : '#fff', color: kind === 'own' ? '#fff' : '#000' }}
        >
          Собственный
        </button>
        <button 
          onClick={() => setKind('franchise')} 
          style={{ marginLeft: 8, background: kind === 'franchise' ? '#000' : '#fff', color: kind === 'franchise' ? '#fff' : '#000' }}
        >
          Франшизный
        </button>
      </div>

      <hr style={{ margin: '1rem 0' }} />

      <h3>Сводка</h3>
      <p><b>Название:</b> {title || '—'}</p>
      <p><b>Город:</b> {city || '—'}</p>
      <p><b>Направление:</b> {direction || '—'}</p>
      <p><b>Тип:</b> {kind === 'own' ? 'Собственный' : 'Франшизный'}</p>
    </div>
  );
}
