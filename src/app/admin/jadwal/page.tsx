// /src/app/admin/jadwal/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { Schedule } from '@/types/database';

export default function AdminJadwalPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchSchedules = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('jadwal').select('*').order('id');
    if (data) setSchedules(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm('Yakin ingin menghapus jadwal ini?')) {
      await supabase.from('jadwal').delete().match({ id });
      fetchSchedules(); // Muat ulang data
    }
  };

  if (loading) return <div className="loading">loading schedule_data.json...</div>;

  return (
    <>
      <Link href="/admin/jadwal/add" className="btn-jadwal">
        <i className="fas fa-plus"></i> Tambah Jadwal Baru
      </Link>
      
      <div className="schedule-list">
        {schedules.map(item => (
          <div key={item.id} className="schedule-card">
            <div className="class-signature">// Class Definition</div>
            <div className="class-name">class {item.mata_kuliah.replace(/\s+/g, '_')} {'{'}</div>
            <div style={{ marginLeft: '1rem' }}>
              <div className="class-property">
                <span className="property-key">instructor:</span>
                <span className="property-value">"{item.dosen}"</span>
              </div>
              <div className="class-property">
                <span className="property-key">schedule:</span>
                <span className="property-value">"{item.hari}, {item.waktu_masuk}-{item.waktu_keluar}"</span>
              </div>
              <div className="class-property">
                <span className="property-key">location:</span>
                <span className="property-value">"{item.ruang}"</span>
              </div>
            </div>
            <div>{'}'}</div>

            <div className="card-actions">
              <Link href={`/admin/jadwal/edit/${item.id}`} className="btn-card btn-edit">
                Edit
              </Link>
              <button onClick={() => handleDelete(item.id)} className="btn-card btn-delete">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}