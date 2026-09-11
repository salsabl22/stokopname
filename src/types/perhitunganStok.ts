// Tipe data untuk modul Pengendalian > Perhitungan Stok (Stock Opname).
// Flow Map 5: Tentukan Produk -> Tugas Perhitungan -> Input Jumlah Fisik ->
// Bandingkan dengan Data -> Ada Selisih? -> (TIDAK: selesai) atau
// (YA: Investigasi Pengecualian -> Barang Bermasalah? -> Penyesuaian Stok
// -> Ajukan Persetujuan -> Menerima Persetujuan?).

export type StatusPerhitunganStok =
  | 'ditugaskan' // Tugas Perhitungan dibuat, menunggu hasil hitung fisik
  | 'tidak_ada_selisih' // Ada Selisih? = TIDAK -> selesai, tidak perlu penyesuaian
  | 'menunggu_investigasi' // Ada Selisih? = YA -> Pengecualian
  | 'menunggu_persetujuan' // Penyesuaian Stok diajukan
  | 'disetujui' // Menerima Persetujuan? = YA -> stok disesuaikan
  | 'ditolak'; // Menerima Persetujuan? = TIDAK -> Penyesuaian Ditolak

export interface PerhitunganStok {
  id: string;
  nomor: string;
  tanggal: string;
  produkId: string;
  produkKode: string;
  produkNama: string;
  satuan: string;
  lokasiPenyimpanan?: string;

  jumlahSistem: number; // dari Ambil Data Persediaan
  jumlahFisik?: number; // Masukan Jumlah yang Ada
  selisih?: number; // jumlahFisik - jumlahSistem
  adaSelisih?: boolean;

  barangBermasalah?: boolean; // decision di tahap Investigasi
  catatanPenyebab?: string; // Tentukan Penyebab, atau catatan Karantina

  status: StatusPerhitunganStok;
  createdAt: string;
  updatedAt: string;
}
