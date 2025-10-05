// /src/app/admin/tugas/TugasList.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { Task } from '@/types/database';

export default function TugasList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchTasks = async () => {
    setLoading(true);
    const { data } = await supabase.from('tugas').select('*').order('deadline', { ascending: true });
    if (data) setTasks(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm('Yakin ingin menghapus tugas ini?')) {
      await supabase.from('tugas').delete().match({ id });
      fetchTasks();
    }
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  if (loading) return <div className="loading">Memuat data tugas...</div>;

  return (
    <>
      <div className="view-header">
        <h2>Daftar Tugas</h2>
        <Link href="/admin/tugas/add" className="btn-add-view">
          <i className="fas fa-plus"></i> Tambah Tugas
        </Link>
      </div>
      <div className="tasks-container">
        {tasks.map(task => (
          <div key={task.id} className="task-card">
            <div className="task-header">
              <h3 className="task-title">{task.tugas}</h3>
              <span className={`task-status ${task.status === 'belum' ? 'status-belum' : 'status-selesai'}`}>{task.status}</span>
            </div>
            <div className="task-detail"><i className="fas fa-book"></i> {task.matkul}</div>
            <div className="task-detail"><i className="fas fa-user-graduate"></i> {task.dosen}</div>
            <div className="task-detail"><i className="fas fa-calendar-day"></i> Deadline: {formatDate(task.deadline)}</div>
            <div className="card-actions">
              <Link href={`/admin/tugas/edit/${task.id}`} className="btn-card btn-edit">Edit</Link>
              <button onClick={() => handleDelete(task.id)} className="btn-card btn-delete">Delete</button>
            </div>
          </div>
        ))}
        {tasks.length === 0 && <p className="no-results">Belum ada tugas yang ditambahkan.</p>}
      </div>
    </>
  );
}