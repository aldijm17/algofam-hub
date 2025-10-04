// /src/components/BottomNav.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: '/', label: 'Beranda' },
  { href: '/jadwal', label: 'Jadwal' },
  { href: '/tugas', label: 'Tugas' },
  { href: '/matakuliah', label: 'Matkul' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav">
      {navLinks.map(link => (
        <Link key={link.href} href={link.href} passHref>
          <button className={`nav-item ${pathname === link.href ? 'active' : ''}`}>
            {link.label}
          </button>
        </Link>
      ))}
    </nav>
  );
}