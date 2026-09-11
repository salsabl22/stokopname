// Tipe data untuk siklus Pesanan Cabang -> Alokasi -> Pengambilan -> Packing
// -> Pengiriman (Flow Map 3). Satu record mengalir lewat seluruh tahap ini,
// persis seperti PesananPembelian mengalir di modul Barang Masuk.

export type StatusPesananCabang =
  | 'menunggu_alokasi' // setelah Validasi Pesanan lolos
  | 'perlu_pengisian_ulang' // Dapat Dialokasikan? = TIDAK
  | 'siap_diambil' // Dapat Dialokasikan? = YA
  | 'pengecualian_pengambilan' // Sudah Sesuai? = TIDAK (saat Pengambilan)
  | 'siap_packing' // Konfirmasi Pengambilan selesai
  | 'siap_kirim' // Packing (Scan & Siapkan Barang) selesai
  | 'gagal_kirim' // Pengiriman Berhasil? = TIDAK
  | 'terkirim'; // Pengiriman Berhasil? = YA -> Database Status Pengiriman

export interface PesananCabangItem {
  id: string;
  produkId: string;
  produkKode: string;
  produkNama: string;
  satuan: string;
  jumlahDipesan: number;
  /** Diisi saat tahap Pengambilan */
  jumlahDiambil?: number;
}

export interface PesananCabang {
  id: string;
  nomorPesanan: string;
  tanggal: string;
  cabangId: string;
  cabangNama: string;
  items: PesananCabangItem[];
  status: StatusPesananCabang;

  // Catatan
  catatan?: string;

  // Tahap Pengambilan
  sudahSesuai?: boolean;
  catatanPengecualian?: string;

  // Tahap Pengiriman
  kurir?: string;
  nomorResi?: string;
  catatanPengiriman?: string;

  createdAt: string;
  updatedAt: string;
}

export interface PesananCabangItemFormValues {
  produkId: string;
  jumlah: string;
  satuan?: string;
}

export interface PesananCabangFormValues {
  cabangId: string;
  items: PesananCabangItemFormValues[];
}

export interface PesananCabangFormErrors {
  cabangId?: string;
  items?: string;
}
