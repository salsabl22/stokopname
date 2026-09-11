// Tipe data untuk modul Barang Masuk.
// Satu record PesananPembelian mengalir melalui seluruh flow map:
// Pesanan Pembelian -> Penerimaan -> Pemeriksaan Kualitas -> Penyimpanan.
// Status merepresentasikan posisi record di flow map saat ini, sehingga
// setiap decision (Barang Sesuai?, Jumlah Sesuai?, Hasil QC?, Perlu Repack?)
// benar-benar tercermin di state, bukan sekadar UI.

export type StatusPO =
  | 'menunggu_pengiriman' // setelah PO valid & disimpan
  | 'barang_datang' // Pengiriman Barang -> Menunggu Kedatangan -> Barang Datang
  | 'pengecualian' // Barang Sesuai? = TIDAK
  | 'menunggu_qc' // Barang Sesuai? = YA (Jumlah Sesuai? dicatat sebagai info, tetap lanjut ke QC)
  | 'perlu_repack' // Hasil QC = BAIK, Perlu Repack? = YA
  | 'siap_penyimpanan' // Hasil QC = BAIK & tidak perlu repack, ATAU repack selesai
  | 'karantina' // Hasil QC = RUSAK
  | 'retur' // Hasil QC = DITOLAK
  | 'disimpan'; // Penyimpanan selesai -> masuk Persediaan

export type HasilQC = 'baik' | 'rusak' | 'ditolak';

export interface POItem {
  id: string;
  produkId: string;
  produkKode: string;
  produkNama: string;
  satuan: string;
  jumlahPesan: number;
  hargaSatuan: number;
  /** Diisi saat tahap Penerimaan (Pengecekan Faktur) */
  jumlahDiterima?: number;
}

export interface PesananPembelian {
  id: string;
  nomorPO: string;
  tanggal: string;
  pemasokId: string;
  pemasokNama: string;
  items: POItem[];
  totalPesanan: number;
  status: StatusPO;

  // Hasil decision di tahap Penerimaan
  barangSesuai?: boolean;
  jumlahSesuai?: boolean;
  catatanSelisih?: string;

  // Hasil decision di tahap Pemeriksaan Kualitas
  hasilQC?: HasilQC;
  perluRepack?: boolean;
  catatanQC?: string;

  // Hasil tahap Penyimpanan
  lokasiPenyimpanan?: string;

  createdAt: string;
  updatedAt: string;
}

export interface POItemFormValues {
  produkId: string;
  jumlah: string;
  hargaSatuan: string;
}

export interface PesananPembelianFormValues {
  pemasokId: string;
  items: POItemFormValues[];
}

export interface PesananPembelianFormErrors {
  pemasokId?: string;
  items?: string; // pesan umum untuk validasi item (kosong / jumlah <= 0)
}
