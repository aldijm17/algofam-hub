// src/components/Search.tsx
'use client';

import { useState } from 'react';

// Ganti 'any' dengan tipe data yang lebih spesifik jika Anda mau
interface SearchResult {
  id: number;
  title: string;
  subtitle: string;
  type: 'tugas' | 'jadwal';
}

export default function Search({ tasks, schedules }: { tasks: any[], schedules: any[] }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value.toLowerCase();
    setQuery(q);

    if (q.length < 2) {
      setResults([]);
      return;
    }

    const taskResults = tasks
      .filter(t => t.tugas.toLowerCase().includes(q) || t.matkul.toLowerCase().includes(q))
      .map(t => ({ id: t.id, title: t.tugas, subtitle: t.matkul, type: 'tugas' as const }));

    const scheduleResults = schedules
      .filter(s => s.mata_kuliah.toLowerCase().includes(q) || s.dosen.toLowerCase().includes(q))
      .map(s => ({ id: s.id, title: s.mata_kuliah, subtitle: s.dosen, type: 'jadwal' as const }));
      
    setResults([...taskResults, ...scheduleResults].slice(0, 5));
  };

  return (
    <div className="search-container" style={{ position: 'relative' }}>
      <input 
        type="text" 
        className="search-bar" 
        placeholder="Cari mata kuliah, tugas..."
        value={query}
        onChange={handleSearch}
      />
      {results.length > 0 && (
        <div className="search-results show">
          {results.map(res => (
            <div key={`${res.type}-${res.id}`} className="list-item" style={{ padding: '1rem' }}>
              <div>
                <div className="list-title">{res.title}</div>
                <div className="list-meta">{res.subtitle}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}