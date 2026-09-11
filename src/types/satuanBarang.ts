// Tipe data untuk modul Data Master > Satuan Barang
// Mengikuti Flow Map 2: Input Satuan Barang -> Konversi Satuan -> Konversi Valid? -> Simpan -> Database

export type StatusSatuan = 'aktif' | 'nonaktif';

export interface SatuanBarang {
  id: string;
  kodeSatuan: string;
  namaSatuan: string;
  satuanDasar: string;
  nilaiKonversi: number;
  status: StatusSatuan;
  createdAt: string;
  updatedAt: string;
}

// Payload untuk form tambah/edit, sebelum melalui validasi
export interface SatuanBarangFormValues {
  kodeSatuan: string;
  namaSatuan: string;
  satuanDasar: string;
  nilaiKonversi: string; // string di form, dikonversi ke number saat submit
  status: StatusSatuan;
}

// Hasil validasi form (mencerminkan decision "Konversi Valid?" pada flow map)
export interface SatuanBarangFormErrors {
  kodeSatuan?: string;
  namaSatuan?: string;
  satuanDasar?: string;
  nilaiKonversi?: string;
}

export const EMPTY_SATUAN_FORM: SatuanBarangFormValues = {
  kodeSatuan: '',
  namaSatuan: '',
  satuanDasar: '',
  nilaiKonversi: '',
  status: 'aktif',
};
