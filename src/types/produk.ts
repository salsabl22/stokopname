// Tipe data untuk modul Data Master > Produk
// Disesuaikan dengan response dari backend API (Prisma + SQLite)

export type StatusProduk = 'aktif' | 'nonaktif';
export type UnitBisnis = 'FOTOSNAPS' | 'KERIPIK_BUJANGAN';

/** Objek satuan dari backend (SatuanBarang) */
export interface SatuanBarang {
  id: string;
  kode: string;
  nama: string;
  deskripsi?: string;
}

/** Produk dari backend API */
export interface Produk {
  id: string;
  kodeProduk: string;
  namaProduk: string;
  kategori: string;
  unitBisnis: UnitBisnis;
  /** Satuan dasar (object dari SatuanBarang) */
  satuan?: SatuanBarang | null;
  satuanId?: string | null;
  /** Satuan pembelian (object dari SatuanBarang) */
  satuanPembelian?: SatuanBarang | null;
  satuanPembelianId?: string | null;
  konversi: number;
  status: StatusProduk;
  deskripsi?: string | null;
  hargaBeli?: number | null;
  trackBatch?: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Form values untuk create/edit produk */
export interface ProdukFormValues {
  kodeProduk: string;
  namaProduk: string;
  kategori: string;
  unitBisnis?: UnitBisnis;
  satuanId: string;
  satuanPembelianId: string;
  konversi: string;
  status: StatusProduk;
  deskripsi?: string;
  hargaBeli?: string;
}

export interface ProdukFormErrors {
  kodeProduk?: string;
  namaProduk?: string;
  kategori?: string;
  satuanId?: string;
  konversi?: string;
}

export const EMPTY_PRODUK_FORM: ProdukFormValues = {
  kodeProduk: '',
  namaProduk: '',
  kategori: '',
  satuanId: '',
  satuanPembelianId: '',
  konversi: '1',
  status: 'aktif',
  deskripsi: '',
  hargaBeli: '',
};

// Kategori untuk Fotosnaps
export const KATEGORI_FOTOSNAPS = [
  'Film & Media',
  'Produk Foto',
  'Aksesoris Jibbitz',
  'Aksesoris Foto',
  'Kertas Cetak',
  'Bahan Produksi',
];

// Kategori untuk Keripik Bujangan
export const KATEGORI_KERIPIK = [
  'Makanan Ringan',
  'Bahan Baku',
  'Kemasan',
];

// Semua kategori (legacy + baru)
export const KATEGORI_PRODUK_OPTIONS = [
  ...KATEGORI_FOTOSNAPS,
  ...KATEGORI_KERIPIK,
  'Makanan Kering',
  'Minuman',
  'Lainnya',
].filter((v, i, a) => a.indexOf(v) === i); // deduplicate
