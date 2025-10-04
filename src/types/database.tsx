
// Ini mendefinisikan struktur objek 'tugas' Anda
export interface Task {
  id: number;
  created_at: string;
  tugas: string;
  deskripsi?: string | null; // Tanda tanya (?) berarti properti ini opsional
  deadline: string;
  matkul?: string | null;
  dosen?: string | null;
  catatan?: string | null;
  status: 'belum' | 'selesai'; // Hanya bisa berisi salah satu dari dua nilai ini
}

export interface Schedule {
  id: number;
  created_at: string;
  mata_kuliah: string;
  dosen: string;
  hari: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu' | 'Minggu';
  waktu_masuk: string; // Format "HH:MM"
  waktu_keluar: string; // Format "HH:MM"
  ruang: string;
}