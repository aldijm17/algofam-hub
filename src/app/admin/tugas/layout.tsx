// /app/admin/tugas/layout.tsx
import './tugas.css';
import { ReactNode } from 'react';

// Definisikan tipe untuk props
interface TugasLayoutProps {
  children: ReactNode;
}

export default function TugasLayout({ children }: TugasLayoutProps) {
  return (
    <>
      {children}
    </>
  );
}