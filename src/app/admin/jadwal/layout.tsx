// /src/app/admin/jadwal/layout.tsx
import './jadwal.css'; // Impor CSS khusus jadwal
import { ReactNode } from 'react';

// Komponen Header Terminal
function TerminalHeader() {
  return (
    <div className="terminal-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div className="terminal-dots">
          <div className="dot red"></div>
          <div className="dot yellow"></div>
          <div className="dot green"></div>
        </div>
        <div className="terminal-title">AlgoFam-Hub Matkul</div>
      </div>
      <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#8b949e' }}>
        ~/admin/matkul
      </div>
    </div>
  );
}

export default function JadwalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="jadwal-admin-container">
      <TerminalHeader />
      <main>{children}</main>
    </div>
  );
}