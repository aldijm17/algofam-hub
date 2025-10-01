// /app/admin/layout.tsx
import './admin.css'; // Impor CSS yang baru
import { ReactNode } from 'react';

// Definisikan tipe untuk props
interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    // Kita tidak perlu tag <section> jika tidak ada styling khusus
    <>
      {children}
    </>
  );
}