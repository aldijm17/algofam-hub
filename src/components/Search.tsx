// src/components/Search.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface SearchResult {
  id: number;
  title: string;
  subtitle: string;
  type: 'tugas' | 'jadwal';
}

export default function Search({ tasks, schedules }: { tasks: any[], schedules: any[] }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const router = useRouter();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value.toLowerCase();
    setQuery(q);

    if (q.length < 2) {
      setResults([]);
      return;
    }

    const taskResults = tasks
      .filter(t => t.tugas.toLowerCase().includes(q) || (t.matkul && t.matkul.toLowerCase().includes(q)))
      .map(t => ({ id: t.id, title: t.tugas, subtitle: t.matkul, type: 'tugas' as const }));

    const scheduleResults = schedules
      .filter(s => s.mata_kuliah.toLowerCase().includes(q) || (s.dosen && s.dosen.toLowerCase().includes(q)))
      .map(s => ({ id: s.id, title: s.mata_kuliah, subtitle: s.dosen, type: 'jadwal' as const }));
      
    setResults([...taskResults, ...scheduleResults].slice(0, 5));
  };

  const handleItemClick = (result: SearchResult) => {
    const { type, id } = result;
    // Navigasi dengan query parameter untuk tab dan highlight
    router.push(`/?tab=${type}&highlight=${type}-${id}`);
    // Reset search
    setQuery('');
    setResults([]);
  };

  return (
    <div className="search-container" style={{ position: 'relative' }}>
      <input 
        type="text" 
        className="search-bar" 
        placeholder="Cari mata kuliah, tugas..."
        value={query}
        onChange={handleSearch}
        onBlur={() => setTimeout(() => setResults([]), 200)} // Sembunyikan hasil saat input tidak fokus
      />
      {results.length > 0 && (
        <div className="search-results show">
          {results.map(res => (
            <div key={`${res.type}-${res.id}`} className="search-result-item" onMouseDown={() => handleItemClick(res)}>
              <div>
                <div className="list-title">{res.title}</div>
                <div className="list-meta">{res.subtitle}</div>
              </div>
              <span className={`result-type-badge ${res.type}`}>
                {res.type}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}