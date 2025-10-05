// /src/app/admin/jadwal/JadwalList.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { Schedule } from '@/types/database';

export default function JadwalList() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchSchedules = async () => {
    setLoading(true);
    const { data } = await supabase.from('jadwal').select('*').order('id');
    if (data) setSchedules(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm('Yakin ingin menghapus jadwal ini?')) {
      await supabase.from('jadwal').delete().match({ id });
      fetchSchedules();
    }
  };

  if (loading) return <div className="loading">Memuat data jadwal...</div>;

  return (
    <>
      <div className="view-header">
        <h2>Daftar Mata Kuliah</h2>
        <Link href="/admin/jadwal/add" className="btn-add-view">
          <i className="fas fa-plus"></i> Tambah Jadwal
        </Link>
      </div>
      <div className="schedule-list">
        {schedules.map(item => (
          <div key={item.id} className="schedule-card">
            <div className="class-name">{item.mata_kuliah}</div>
            <div className="class-property"><strong>Dosen:</strong> {item.dosen}</div>
            <div className="class-property"><strong>Waktu:</strong> {item.hari}, {item.waktu_masuk}-{item.waktu_keluar}</div>
            <div className="class-property"><strong>Ruang:</strong> {item.ruang}</div>
            <div className="card-actions">
              <Link href={`/admin/jadwal/edit/${item.id}`} className="btn-card btn-edit">Edit</Link>
              <button onClick={() => handleDelete(item.id)} className="btn-card btn-delete">Delete</button>
            </div>
          </div>
        ))}
        {schedules.length === 0 && <p className="no-results">Belum ada jadwal yang ditambahkan.</p>}
      </div>
    </>
  );
}