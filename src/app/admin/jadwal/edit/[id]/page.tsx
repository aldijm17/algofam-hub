// /src/app/admin/jadwal/edit/[id]/page.tsx
'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Schedule } from '@/types/database';

export default function EditJadwalPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const supabase = createClient();
  const [schedule, setSchedule] = useState<Schedule | null>(null);

  useEffect(() => {
    const fetchSchedule = async () => {
      const { data } = await supabase.from('jadwal').select('*').eq('id', id).single();
      if (data) setSchedule(data as Schedule);
    };
    if (id) fetchSchedule();
  }, [id]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const updatedData = Object.fromEntries(formData.entries());

    await supabase.from('jadwal').update(updatedData).match({ id });
    alert('Jadwal berhasil di-update!');
    router.push('/admin/jadwal');
    router.refresh();
  };

  if (!schedule) return <div className="loading">loading...</div>;

  return (
    <form onSubmit={handleSubmit} className="form-jadwal">
      <div className="form-group">
        <label htmlFor="mata_kuliah">const MATA_KULIAH =</label>
        <input type="text" id="mata_kuliah" name="mata_kuliah" defaultValue={schedule.mata_kuliah} required />
      </div>
      <div className="form-group">
        <label htmlFor="dosen">const DOSEN =</label>
        <input type="text" id="dosen" name="dosen" defaultValue={schedule.dosen} required />
      </div>
      <div className="form-group">
        <label htmlFor="hari">let hari =</label>
        <select id="hari" name="hari" defaultValue={schedule.hari} required>
          <option value="Senin">"Senin"</option>
          <option value="Selasa">"Selasa"</option>
          <option value="Rabu">"Rabu"</option>
          <option value="Kamis">"Kamis"</option>
          <option value="Jumat">"Jumat"</option>
          <option value="Sabtu">"Sabtu"</option>
          <option value="Minggu">"Minggu"</option>
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="waktu_masuk">const WAKTU_MASUK =</label>
        <input type="time" id="waktu_masuk" name="waktu_masuk" defaultValue={schedule.waktu_masuk} required />
      </div>
       <div className="form-group">
        <label htmlFor="waktu_keluar">const WAKTU_KELUAR =</label>
        <input type="time" id="waktu_keluar" name="waktu_keluar" defaultValue={schedule.waktu_keluar} required />
      </div>
      <div className="form-group">
        <label htmlFor="ruang">const RUANG =</label>
        <input type="text" id="ruang" name="ruang" defaultValue={schedule.ruang} required />
      </div>
      <button type="submit" className="btn-jadwal btn-submit">
        Update()
      </button>
    </form>
  );
}