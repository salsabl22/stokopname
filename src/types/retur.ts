// Tipe data untuk modul Barang Keluar > Retur.
// Flow Map 4: dua sumber retur -> Validasi Pengajuan -> Kirim Retur Gudang
// -> Penerimaan Retur (Sesuai Pengajuan?) -> Periksa Retur (Kondisi Barang?)
// -> Kembali ke Persediaan / Masuk Karantina / Return ke Pemasok.

export type SumberRetur = 'cabang' | 'internal';

export type StatusRetur =
  | 'diajukan' // Data Retur Valid? = YA -> Kirim Retur Gudang
  | 'diterima' // Sesuai Pengajuan? = YA
  | 'pengecualian' // Sesuai Pengajuan? = TIDAK -> Catat Pengecualian
  | 'kembali_ke_stok' // Kondisi Barang? = BAIK
  | 'karantina' // Kondisi Barang? = RUSAK
  | 'retur_pemasok'; // Kondisi Barang? = DITOLAK/CACAT

export type KondisiBarangRetur = 'baik' | 'rusak' | 'ditolak';

export interface ReturItem {
  id: string;
  produkId: string;
  produkKode: string;
  produkNama: string;
  satuan: string;
  jumlah: number;
}

export interface Retur {
  id: string;
  nomorRetur: string;
  tanggal: string;
  sumber: SumberRetur;

  // Sumber = cabang
  cabangId?: string;
  cabangNama?: string;

  // Sumber = internal (barang ditolak dari QC Barang Masuk)
  poId?: string;
  poNomor?: string;
  pemasokNama?: string;

  items: ReturItem[];
  alasan: string; // Identifikasi Transaksi / Masukan Data Retur
  status: StatusRetur;

  sesuaiPengajuan?: boolean;
  catatanPengecualian?: string;

  kondisiBarang?: KondisiBarangRetur;
  catatanPemeriksaan?: string;

  // Foto kerusakan barang (base64 atau URL)
  fotoKerusakan?: string;

  createdAt: string;
  updatedAt: string;
}

export interface ReturItemFormValues {
  produkId: string;
  jumlah: string;
}

export interface ReturFormValues {
  sumber: SumberRetur;
  cabangId: string;
  poId: string;
  items: ReturItemFormValues[];
  alasan: string;
}

export interface ReturFormErrors {
  cabangId?: string;
  poId?: string;
  items?: string;
  alasan?: string;
}
