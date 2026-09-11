// Tipe data untuk modul Data Master > Gudang & Lokasi
// Struktur wajib hierarkis: Gudang -> Rak -> Lokasi Penyimpanan.
// Data lokasi TIDAK berdiri sendiri, selalu berelasi ke struktur gudang di atasnya.

export type StatusGudang = 'aktif' | 'nonaktif';

export interface Gudang {
  id: string;
  kodeGudang: string;
  namaGudang: string;
  alamat: string;
  status: StatusGudang;
  createdAt: string;
}

export interface Rak {
  id: string;
  gudangId: string;
  kodeRak: string;
  namaRak: string;
  createdAt: string;
}

export interface LokasiPenyimpanan {
  id: string;
  rakId: string;
  kodeLokasi: string;
  namaLokasi: string;
  createdAt: string;
}

export interface GudangFormValues {
  kodeGudang: string;
  namaGudang: string;
  alamat: string;
  status: StatusGudang;
}

export interface GudangFormErrors {
  kodeGudang?: string;
  namaGudang?: string;
  alamat?: string;
}

export const EMPTY_GUDANG_FORM: GudangFormValues = {
  kodeGudang: '',
  namaGudang: '',
  alamat: '',
  status: 'aktif',
};

export interface SimpleNodeFormValues {
  kode: string;
  nama: string;
}

export const EMPTY_NODE_FORM: SimpleNodeFormValues = { kode: '', nama: '' };
