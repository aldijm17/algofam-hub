// /app/admin/tugas/page.tsx
'use client';

import { useEffect, useState, ChangeEvent } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { Task } from '@/types/database';

export default function AdminTugasPage() {
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all');
  const supabase = createClient();

  const fetchTasks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tugas')
      .select('*')
      .order('deadline', { ascending: true });

    if (error) {
      console.error('Error fetching tasks:', error);
    } else {
      setAllTasks(data as Task[]);
      setFilteredTasks(data as Task[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Logika untuk filter pencarian
  useEffect(() => {
    let results = allTasks;
    if (searchTerm) {
      results = allTasks.filter(task => {
        const term = searchTerm.toLowerCase();
        if (filterType === 'all') {
          return (
            task.tugas.toLowerCase().includes(term) ||
            task.matkul?.toLowerCase().includes(term) ||
            task.dosen?.toLowerCase().includes(term)
          );
        }
        if (filterType === 'tugas') return task.tugas.toLowerCase().includes(term);
        if (filterType === 'matkul') return task.matkul?.toLowerCase().includes(term);
        if (filterType === 'dosen') return task.dosen?.toLowerCase().includes(term);
        return false;
      });
    }
    setFilteredTasks(results);
  }, [searchTerm, filterType, allTasks]);

  const handleStatusToggle = async (id: number, currentStatus: Task['status']) => {
    const newStatus = currentStatus === 'belum' ? 'selesai' : 'belum';
    const { error } = await supabase.from('tugas').update({ status: newStatus }).match({ id });
    if (error) alert('Gagal mengubah status');
    else fetchTasks(); // Muat ulang data setelah berhasil
  };

  const handleDelete = async (taskId: number) => {
    if (window.confirm('Yakin ingin menghapus tugas ini?')) {
      const { error } = await supabase.from('tugas').delete().match({ id: taskId });
      if (error) alert('Gagal menghapus tugas');
      else fetchTasks(); // Muat ulang data
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  return (
    <div className="admin-container">
      <h1>⚡ Admin CRUD Tugas</h1>
      <Link href="/admin/tugas/add" className="btn btn-add">
        <i className="fas fa-plus"></i> Tambah Tugas
      </Link>
      
      <div className="search-container">
        <select 
          className="search-filter"
          value={filterType}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => setFilterType(e.target.value)}
        >
          <option value="all">Semua Kategori</option>
          <option value="tugas">Judul Tugas</option>
          <option value="matkul">Mata Kuliah</option>
          <option value="dosen">Dosen</option>
        </select>
        <input 
          type="text" 
          className="search-input" 
          placeholder="Cari tugas..." 
          value={searchTerm}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="loading">⏳ Memuat data tugas...</div>
      ) : (
        <div className="tasks-container">
          {filteredTasks.length > 0 ? (
            filteredTasks.map(task => (
              <div key={task.id} className="task-card">
                <div className="task-header">
                  <h3 className="task-title">{task.tugas}</h3>
                  <span className={`task-status ${task.status === 'belum' ? 'status-belum' : 'status-selesai'}`}>
                    {task.status === 'belum' ? 'Belum Selesai' : 'Selesai'}
                  </span>
                </div>
                
                <div className="task-detail">
                  <span className="detail-icon"><i className="fas fa-book"></i></span>
                  <span>{task.matkul || "-"}</span>
                </div>
                <div className="task-detail">
                  <span className="detail-icon"><i className="fas fa-user-graduate"></i></span>
                  <span>{task.dosen || "-"}</span>
                </div>
                <div className="task-detail">
                  <span className="detail-icon"><i className="fas fa-calendar-day"></i></span>
                  <span>Deadline: {formatDate(task.deadline)}</span>
                </div>
                
                {task.deskripsi && (
                  <div className="task-description">
                    <strong>Deskripsi:</strong> {task.deskripsi}
                  </div>
                )}
                
                <div className="task-actions">
                  <button onClick={() => handleStatusToggle(task.id, task.status)} className={`btn btn-status ${task.status === 'belum' ? 'belum' : ''}`}>
                    <i className={`fas ${task.status === 'belum' ? 'fa-check' : 'fa-undo'}`}></i>
                    {task.status === 'belum' ? 'Tandai Selesai' : 'Tandai Belum'}
                  </button>
                  <div>
                    <Link href={`/admin/tugas/edit/${task.id}`} className="btn btn-edit"><i className="fas fa-edit"></i></Link>
                    <button onClick={() => handleDelete(task.id)} className="btn btn-delete"><i className="fas fa-trash"></i></button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-results">Tidak ada tugas yang sesuai dengan pencarian.</div>
          )}
        </div>
      )}
    </div>
  );
}