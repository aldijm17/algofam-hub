// /app/admin/tugas/add/page.tsx
'use client'

import { useState, FormEvent, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { Schedule } from '@/types/database'

export default function AddTugasPage() {
  const router = useRouter()
  const supabase = createClient()
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [schedules, setSchedules] = useState<Schedule[]>([])

  useEffect(() => {
    const fetchSchedules = async () => {
      const { data, error } = await supabase.from('jadwal').select('mata_kuliah');
      if (error) {
        console.error('Error fetching schedules:', error);
      } else if (data) {
        setSchedules(data as Schedule[]);
      }
    };
    fetchSchedules();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)
    const taskData = {
      tugas: formData.get('tugas') as string,
      deskripsi: formData.get('deskripsi') as string,
      deadline: formData.get('deadline') as string,
      matkul: formData.get('matkul') as string,
      dosen: formData.get('dosen') as string,
      catatan: formData.get('catatan') as string,
      status: 'belum'
    };

    const { error } = await supabase.from('tugas').insert([taskData])

    if (error) {
      alert('Gagal menambahkan tugas: ' + error.message)
    } else {
      alert('Tugas berhasil ditambahkan!')
      router.push('/admin/tugas')
    }
    setIsSubmitting(false)
  }

  return (
    <div className="admin-container form-page">
      <Link href="/admin/tugas" className="btn btn-back"><i className="fas fa-arrow-left"></i> Kembali</Link>
      <h2>➕ Tambah Tugas Baru</h2>
      <div className="form-container">
        <form id="taskForm" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="tugas">Nama Tugas *</label>
            <input type="text" id="tugas" name="tugas" placeholder="Masukkan nama tugas" required />
          </div>
          <div className="form-group">
            <label htmlFor="deskripsi">Deskripsi Tugas</label>
            <textarea id="deskripsi" name="deskripsi" placeholder="Masukkan deskripsi tugas (opsional)"></textarea>
          </div>
          <div className="form-group">
            <label htmlFor="deadline">Deadline *</label>
            <input type="date" id="deadline" name="deadline" required />
          </div>
          <div className="form-group">
            <label htmlFor="matkul">Mata Kuliah *</label>
            <select id="matkul" name="matkul" required>
              <option value="">Pilih Mata Kuliah</option>
              {[...new Set(schedules.map(schedule => schedule.mata_kuliah))].map(mata_kuliah => (
                <option key={mata_kuliah} value={mata_kuliah}>{mata_kuliah}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="dosen">Dosen Pengampu *</label>
            <input type="text" id="dosen" name="dosen" placeholder="Masukkan nama dosen" required />
          </div>
          <div className="form-group">
            <label htmlFor="catatan">Catatan Tambahan</label>
            <textarea id="catatan" name="catatan" placeholder="Masukkan catatan tambahan (opsional)"></textarea>
          </div>
          <button type="submit" className="btn btn-submit" disabled={isSubmitting}>
            <i className="fas fa-save"></i> {isSubmitting ? 'Menyimpan...' : 'Simpan Tugas'}
          </button>
        </form>
      </div>
    </div>
  )
}