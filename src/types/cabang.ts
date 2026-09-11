// Tipe data untuk modul Data Master > Cabang
// Flow: Input Data Cabang -> Masukkan Kode Cabang -> Periksa Kelengkapan Data
// -> Kode Cabang Sudah Ada? (YA -> notif; TIDAK -> Periksa Kelengkapan -> Lengkap?
// (TIDAK -> notif; YA -> Simpan -> "Cabang berhasil disimpan" -> Database))

export type StatusCabang = 'aktif' | 'nonaktif';

export interface Cabang {
  id: string;
  kodeCabang: string;
  namaCabang: string;
  alamat: string;
  telepon: string;
  status: StatusCabang;
  createdAt: string;
  updatedAt: string;
}

export interface CabangFormValues {
  kodeCabang: string;
  namaCabang: string;
  alamat: string;
  telepon: string;
  status: StatusCabang;
}

export interface CabangFormErrors {
  kodeCabang?: string;
  namaCabang?: string;
  alamat?: string;
  telepon?: string;
  /** Pesan umum, dipakai untuk kasus "kode telah digunakan" / "data belum lengkap" */
  general?: string;
}

export const EMPTY_CABANG_FORM: CabangFormValues = {
  kodeCabang: '',
  namaCabang: '',
  alamat: '',
  telepon: '',
  status: 'aktif',
};
