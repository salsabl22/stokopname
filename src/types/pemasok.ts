// Tipe data untuk modul Data Master > Pemasok
// Flow: Pemasok -> Input Pemasok -> Validasi Data -> Simpan -> Database

export type StatusPemasok = 'aktif' | 'nonaktif';

export interface Pemasok {
  id: string;
  kodePemasok: string;
  namaPemasok: string;
  kontak: string;
  email: string;
  alamat: string;
  status: StatusPemasok;
  createdAt: string;
  updatedAt: string;
}

export interface PemasokFormValues {
  kodePemasok: string;
  namaPemasok: string;
  kontak: string;
  email: string;
  alamat: string;
  status: StatusPemasok;
}

export interface PemasokFormErrors {
  kodePemasok?: string;
  namaPemasok?: string;
  kontak?: string;
  email?: string;
  alamat?: string;
}

export const EMPTY_PEMASOK_FORM: PemasokFormValues = {
  kodePemasok: '',
  namaPemasok: '',
  kontak: '',
  email: '',
  alamat: '',
  status: 'aktif',
};
