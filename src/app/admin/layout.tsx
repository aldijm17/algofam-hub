// /src/app/admin/layout.tsx
import './admin.css';
import { ReactNode } from 'react';

export default function AdminDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="admin-dashboard">
       <header className="admin-header">
        <h1>Admin Dashboard</h1>
      </header>
      <main>
        {children}
      </main>
    </div>
  );
}