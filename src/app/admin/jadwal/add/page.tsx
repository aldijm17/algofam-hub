// /src/app/admin/jadwal/add/page.tsx
'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';

export default function AddJadwalPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);
    const scheduleData = Object.fromEntries(formData.entries());

    await supabase.from('jadwal').insert([scheduleData]);
    
    alert('Jadwal berhasil ditambahkan!');
    router.push('/admin/jadwal');
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="form-jadwal">
      <div className="form-group">
        <label htmlFor="mata_kuliah">const MATA_KULIAH =</label>
        <input type="text" id="mata_kuliah" name="mata_kuliah" required />
      </div>
      <div className="form-group">
        <label htmlFor="dosen">const DOSEN =</label>
        <input type="text" id="dosen" name="dosen" required />
      </div>
      <div className="form-group">
        <label htmlFor="hari">let hari =</label>
        <select id="hari" name="hari" required>
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
        <input type="time" id="waktu_masuk" name="waktu_masuk" required />
      </div>
       <div className="form-group">
        <label htmlFor="waktu_keluar">const WAKTU_KELUAR =</label>
        <input type="time" id="waktu_keluar" name="waktu_keluar" required />
      </div>
      <div className="form-group">
        <label htmlFor="ruang">const RUANG =</label>
        <input type="text" id="ruang" name="ruang" required />
      </div>
      <button type="submit" className="btn-jadwal btn-submit" disabled={isSubmitting}>
        {isSubmitting ? 'Compiling...' : 'Commit()'}
      </button>
    </form>
  );
}