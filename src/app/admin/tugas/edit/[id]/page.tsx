// /src/app/admin/tugas/edit/[id]/page.tsx
'use client'

import { useEffect, useState, FormEvent } from 'react'
// Impor useParams dari next/navigation
import { useRouter, useParams } from 'next/navigation' 
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { Task } from '@/types/database'

export default function EditTugasPage() {
  const router = useRouter();
  // Gunakan useParams untuk mendapatkan parameter dari URL
  const params = useParams();
  const id = params.id as string; // Ambil id dari objek params

  const supabase = createClient();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (!id) return;

    const fetchTask = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('tugas')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        alert('Gagal mengambil data tugas.');
        router.push('/admin/tugas');
      } else {
        setTask(data as Task);
      }
      setLoading(false);
    };
    
    fetchTask();
  }, [id, router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const updatedData = Object.fromEntries(formData.entries());

    const { error } = await supabase
      .from('tugas')
      .update(updatedData)
      .match({ id: id });

    if (error) {
      alert('Gagal memperbarui tugas: ' + error.message);
    } else {
      alert('Tugas berhasil diperbarui!');
      router.push('/admin/tugas');
      router.refresh(); 
    }
    setIsSubmitting(false);
  };

  if (loading || !task) return <div className="loading">Memuat data...</div>;

  return (
    <div className="admin-container form-page">
      <Link href="/admin/tugas" className="btn btn-back"><i className="fas fa-arrow-left"></i> Kembali</Link>
      <h2>✏️ Edit Tugas</h2>
      <div className="form-container">
        <form id="editForm" onSubmit={handleSubmit}>
          {/* Sisa formulir tidak berubah */}
          <div className="form-group">
            <label htmlFor="tugas">Nama Tugas *</label>
            <input type="text" id="tugas" name="tugas" defaultValue={task.tugas} required />
          </div>
          <div className="form-group">
            <label htmlFor="deskripsi">Deskripsi Tugas</label>
            <textarea id="deskripsi" name="deskripsi" defaultValue={task.deskripsi ?? ''}></textarea>
          </div>
          <div className="form-group">
            <label htmlFor="deadline">Deadline *</label>
            <input type="date" id="deadline" name="deadline" defaultValue={task.deadline} required />
          </div>
          <div className="form-group">
            <label htmlFor="matkul">Mata Kuliah *</label>
            <input type="text" id="matkul" name="matkul" defaultValue={task.matkul ?? ''} required />
          </div>
          <div className="form-group">
            <label htmlFor="dosen">Dosen Pengampu *</label>
            <input type="text" id="dosen" name="dosen" defaultValue={task.dosen ?? ''} required />
          </div>
          <div className="form-group">
            <label htmlFor="catatan">Catatan Tambahan</label>
            <textarea id="catatan" name="catatan" defaultValue={task.catatan ?? ''}></textarea>
          </div>
          <button type="submit" className="btn btn-submit" disabled={isSubmitting}>
            <i className="fas fa-save"></i> {isSubmitting ? 'Memperbarui...' : 'Perbarui Tugas'}
          </button>
        </form>
      </div>
    </div>
  );
}