// src/components/BottomNav.tsx
'use client'

// Definisikan tipe untuk props yang akan diterima komponen
interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const navLinks = [
  { id: 'beranda', label: 'Beranda' },
  { id: 'jadwal', label: 'Jadwal' },
  { id: 'tugas', label: 'Tugas' },
];

// Terima props sebagai argumen di dalam komponen
export default function BottomNav({ activeTab, setActiveTab }: BottomNavProps) {
  return (
    <nav className="bottom-nav">
      {navLinks.map(link => (
        <button 
          key={link.id} 
          // Gunakan props untuk menentukan kelas 'active' dan fungsi onClick
          className={`nav-item ${activeTab === link.id ? 'active' : ''}`}
          onClick={() => setActiveTab(link.id)}
        >
          {link.label}
        </button>
      ))}
    </nav>
  );
}