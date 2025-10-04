// src/components/DetailModal.tsx
'use client'

import { Task, Schedule } from "@/types/database";

interface DetailModalProps {
  item: { type: 'task' | 'schedule'; data: Task | Schedule };
  allTasks: Task[];
  onClose: () => void;
}

export default function DetailModal({ item, allTasks, onClose }: DetailModalProps) {
  const { type, data } = item;

  const relatedTasks = type === 'schedule'
    ? allTasks.filter(task => task.matkul === (data as Schedule).mata_kuliah)
    : [];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>&times;</button>
        {type === 'schedule' && (
          <>
            <h2>Detail Jadwal</h2>
            <div className="detail-field"><strong>Mata Kuliah:</strong> {(data as Schedule).mata_kuliah}</div>
            <div className="detail-field"><strong>Dosen:</strong> {(data as Schedule).dosen}</div>
            <div className="detail-field"><strong>Waktu:</strong> {(data as Schedule).hari}, {(data as Schedule).waktu_masuk} - {(data as Schedule).waktu_keluar}</div>
            <div className="detail-field"><strong>Ruang:</strong> {(data as Schedule).ruang}</div>
            <hr />
            <h3>Tugas Terkait:</h3>
            {relatedTasks.length > 0 ? relatedTasks.map(task => (
              <div key={task.id} className="list-item-mini">{task.tugas}</div>
            )) : <p>Tidak ada tugas terkait.</p>}
          </>
        )}
        {type === 'task' && (
          <>
            <h2>Detail Tugas</h2>
            <div className="detail-field"><strong>Tugas:</strong> {(data as Task).tugas}</div>
            <div className="detail-field"><strong>Mata Kuliah:</strong> {(data as Task).matkul}</div>
            <div className="detail-field"><strong>Deadline:</strong> {new Date((data as Task).deadline).toLocaleDateString('id-ID')}</div>
            <div className="detail-field"><strong>Status:</strong> {(data as Task).status}</div>
            <div className="detail-field"><strong>Deskripsi:</strong> {(data as Task).deskripsi || '-'}</div>
          </>
        )}
      </div>
    </div>
  );
}