// /src/app/admin/page.tsx
'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import JadwalList from './jadwal/JadwalList';
import TugasList from './tugas/TugasList';

function AdminDashboardContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'jadwal';
  const [activeTab, setActiveTab] = useState(initialTab);

  return (
    <>
      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === 'jadwal' ? 'active' : ''}`}
          onClick={() => setActiveTab('jadwal')}
        >
          <i className="fas fa-calendar-alt"></i> Jadwal Kuliah
        </button>
        <button
          className={`tab-btn ${activeTab === 'tugas' ? 'active' : ''}`}
          onClick={() => setActiveTab('tugas')}
        >
          <i className="fas fa-tasks"></i> Manajemen Tugas
        </button>
      </div>
      <div className="admin-content">
        {activeTab === 'jadwal' ? <JadwalList /> : <TugasList />}
      </div>
    </>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<div className="loading">Memuat...</div>}>
      <AdminDashboardContent />
    </Suspense>
  );
}