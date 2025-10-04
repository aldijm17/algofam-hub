// /src/app/(client)/layout.tsx
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Header dan Search akan muncul di semua halaman client */}
      <Header />
      {/* Di sini Anda bisa menambahkan komponen Search jika ingin ada di semua halaman */}
      
      {/* Konten halaman akan dirender di sini */}
      <main className="page-content">{children}</main>
      
      <BottomNav />
    </>
  );
}