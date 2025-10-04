// /src/components/Header.tsx
'use client';

import { useState, useEffect } from 'react';

export default function Header() {
  const [time, setTime] = useState('--:--:--');
  const [date, setDate] = useState('Memuat...');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTime(now.toLocaleTimeString('id-ID'));
      setDate(now.toLocaleDateString('id-ID', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="main-header">
      <div className="current-time">{time}</div>
      <div className="current-date">{date}</div>
    </header>
  );
}