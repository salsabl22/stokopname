// ============================================================================
// WMS CENTRAL STORAGE LAYER WITH LOCALSTORAGE PERSISTENCE & COHESIVE SEED DATA
// ============================================================================

import type { SatuanBarang } from '../types/satuanBarang';
import type { Produk } from '../types/produk';
import type { Pemasok } from '../types/pemasok';
import type { Cabang } from '../types/cabang';
import type { Gudang, Rak, LokasiPenyimpanan } from '../types/gudang';
import type { BarcodeItem } from '../types/barcode';
import type { StokItem } from '../types/persediaan';
import type { PerhitunganStok } from '../types/perhitunganStok';
import type { UserTask } from '../types/task';

const STORAGE_KEYS = {
  SATUAN: 'wms_satuan_barang_v1',
  PRODUK: 'wms_produk_v1',
  PEMASOK: 'wms_pemasok_v1',
  CABANG: 'wms_cabang_v1',
  GUDANG: 'wms_gudang_v1',
  RAK: 'wms_rak_v1',
  LOKASI: 'wms_lokasi_v1',
  BARCODE: 'wms_barcode_v1',
  PERSEDIAAN: 'wms_persediaan_v1',
  OPNAME: 'wms_perhitungan_stok_v1',
  TASKS: 'wms_user_tasks_v1',
};

// ----------------------------------------------------------------------------
// INITIAL SEED DATA
// ----------------------------------------------------------------------------

const INITIAL_SATUAN: SatuanBarang[] = [
  { id: 's1', kodeSatuan: 'PCS', namaSatuan: 'Pieces', satuanDasar: 'PCS', nilaiKonversi: 1, status: 'aktif', createdAt: '2026-01-10T08:00:00Z', updatedAt: '2026-01-10T08:00:00Z' },
  { id: 's2', kodeSatuan: 'BAL', namaSatuan: 'Bal', satuanDasar: 'PCS', nilaiKonversi: 20, status: 'aktif', createdAt: '2026-01-10T08:05:00Z', updatedAt: '2026-01-10T08:05:00Z' },
  { id: 's3', kodeSatuan: 'BOX', namaSatuan: 'Box', satuanDasar: 'PCS', nilaiKonversi: 10, status: 'aktif', createdAt: '2026-01-11T09:00:00Z', updatedAt: '2026-01-11T09:00:00Z' },
  { id: 's4', kodeSatuan: 'KARTON', namaSatuan: 'Karton', satuanDasar: 'PCS', nilaiKonversi: 50, status: 'aktif', createdAt: '2026-01-12T10:00:00Z', updatedAt: '2026-01-12T10:00:00Z' },
  { id: 's5', kodeSatuan: 'KG', namaSatuan: 'Kilogram', satuanDasar: 'KG', nilaiKonversi: 1, status: 'aktif', createdAt: '2026-01-13T11:00:00Z', updatedAt: '2026-01-13T11:00:00Z' },
  { id: 's6', kodeSatuan: 'LITER', namaSatuan: 'Liter', satuanDasar: 'LITER', nilaiKonversi: 1, status: 'nonaktif', createdAt: '2026-01-14T11:00:00Z', updatedAt: '2026-01-14T11:00:00Z' },
];

const INITIAL_PRODUK: any[] = [
  { id: 'p1', kodeProduk: 'FOOD-001', namaProduk: 'Makanan Ringan X', kategori: 'Makanan Kering', unitBisnis: 'FOTOSNAPS', satuan: { id: 's1', kode: 'PCS', nama: 'Pieces' }, satuanPembelian: { id: 's2', kode: 'BAL', nama: 'Bal' }, satuanId: 's1', satuanPembelianId: 's2', konversi: 20, status: 'aktif', createdAt: '2026-01-15T08:00:00Z', updatedAt: '2026-01-15T08:00:00Z' },
  { id: 'p2', kodeProduk: 'FOOD-002', namaProduk: 'Biskuit Gandum Y', kategori: 'Makanan Kering', unitBisnis: 'FOTOSNAPS', satuan: { id: 's1', kode: 'PCS', nama: 'Pieces' }, satuanPembelian: { id: 's2', kode: 'BAL', nama: 'Bal' }, satuanId: 's1', satuanPembelianId: 's2', konversi: 24, status: 'aktif', createdAt: '2026-01-16T08:00:00Z', updatedAt: '2026-01-16T08:00:00Z' },
  { id: 'p3', kodeProduk: 'FOOD-003', namaProduk: 'Minuman Soda Z', kategori: 'Minuman', unitBisnis: 'FOTOSNAPS', satuan: { id: 's1', kode: 'PCS', nama: 'Pieces' }, satuanPembelian: { id: 's3', kode: 'BOX', nama: 'Box' }, satuanId: 's1', satuanPembelianId: 's3', konversi: 12, status: 'aktif', createdAt: '2026-01-17T08:00:00Z', updatedAt: '2026-01-17T08:00:00Z' },
  { id: 'p4', kodeProduk: 'MAT-001', namaProduk: 'Tepung Terigu Serbaguna', kategori: 'Bahan Baku', unitBisnis: 'FOTOSNAPS', satuan: { id: 's5', kode: 'KG', nama: 'Kilogram' }, satuanPembelian: { id: 's4', kode: 'KARTON', nama: 'Karton' }, satuanId: 's5', satuanPembelianId: 's4', konversi: 25, status: 'aktif', createdAt: '2026-01-18T08:00:00Z', updatedAt: '2026-01-18T08:00:00Z' },
  { id: 'p5', kodeProduk: 'PKG-001', namaProduk: 'Kardus Master Box 50x40', kategori: 'Kemasan', unitBisnis: 'FOTOSNAPS', satuan: { id: 's1', kode: 'PCS', nama: 'Pieces' }, satuanPembelian: { id: 's2', kode: 'BAL', nama: 'Bal' }, satuanId: 's1', satuanPembelianId: 's2', konversi: 50, status: 'aktif', createdAt: '2026-01-19T08:00:00Z', updatedAt: '2026-01-19T08:00:00Z' },
];

const INITIAL_PEMASOK: Pemasok[] = [
  { id: 'sp1', kodePemasok: 'SUP-001', namaPemasok: 'PT Sumber Pangan Sejahtera', kontak: '081234567890', email: 'order@sumberpangan.co.id', alamat: 'Jl. Industri Raya No. 12, Bandung', status: 'aktif', createdAt: '2026-01-10T08:00:00Z', updatedAt: '2026-01-10T08:00:00Z' },
  { id: 'sp2', kodePemasok: 'SUP-002', namaPemasok: 'CV Distributor Minuman Nusantara', kontak: '081298765432', email: 'sales@dmn.co.id', alamat: 'Jl. Soekarno Hatta No. 45, Bandung', status: 'aktif', createdAt: '2026-01-11T08:00:00Z', updatedAt: '2026-01-11T08:00:00Z' },
  { id: 'sp3', kodePemasok: 'SUP-003', namaPemasok: 'PT Kemasan Perkasa Abadi', kontak: '082155566778', email: 'supply@kemasanperkasa.com', alamat: 'Kawasan Industri Cikarang Blok B2', status: 'aktif', createdAt: '2026-01-12T08:00:00Z', updatedAt: '2026-01-12T08:00:00Z' },
];

const INITIAL_CABANG: Cabang[] = [
  { id: 'c1', kodeCabang: 'CBG-BDG', namaCabang: 'Cabang Bandung Dipatiukur', alamat: 'Jl. Dipatiukur No. 10, Bandung', telepon: '0221234567', status: 'aktif', createdAt: '2026-01-05T08:00:00Z', updatedAt: '2026-01-05T08:00:00Z' },
  { id: 'c2', kodeCabang: 'CBG-JKT', namaCabang: 'Cabang Jakarta Selatan', alamat: 'Jl. Sudirman No. 88, Jakarta Selatan', telepon: '0219876543', status: 'aktif', createdAt: '2026-01-06T08:00:00Z', updatedAt: '2026-01-06T08:00:00Z' },
  { id: 'c3', kodeCabang: 'CBG-SBY', namaCabang: 'Cabang Surabaya Gubeng', alamat: 'Jl. Pemuda No. 45, Surabaya', telepon: '0314567890', status: 'aktif', createdAt: '2026-01-07T08:00:00Z', updatedAt: '2026-01-07T08:00:00Z' },
];

const INITIAL_GUDANG: Gudang[] = [
  { id: 'g1', kodeGudang: 'GDG-PUSAT', namaGudang: 'Gudang Pusat', alamat: 'Jl. Soekarno Hatta No. 100, Bandung', status: 'aktif', createdAt: '2026-01-05T08:00:00Z' },
];

const INITIAL_RAK: Rak[] = [
  { id: 'r1', gudangId: 'g1', kodeRak: 'A-01', namaRak: 'Rak A-01 (Fast Moving)', createdAt: '2026-01-05T08:20:00Z' },
  { id: 'r2', gudangId: 'g1', kodeRak: 'A-02', namaRak: 'Rak A-02 (Medium Moving)', createdAt: '2026-01-05T08:21:00Z' },
  { id: 'r3', gudangId: 'g1', kodeRak: 'B-01', namaRak: 'Rak B-01 (Minuman Ringan)', createdAt: '2026-01-05T08:22:00Z' },
  { id: 'r4', gudangId: 'g1', kodeRak: 'C-01', namaRak: 'Rak C-01 (Bahan Baku)', createdAt: '2026-01-05T08:23:00Z' },
  { id: 'r5', gudangId: 'g1', kodeRak: 'BF-01', namaRak: 'Rak Buffer 1', createdAt: '2026-01-06T08:20:00Z' },
];

const INITIAL_LOKASI: LokasiPenyimpanan[] = [
  { id: 'l1', rakId: 'r1', kodeLokasi: 'A-01-01', namaLokasi: 'A-01 Lantai 1', createdAt: '2026-01-05T08:30:00Z' },
  { id: 'l2', rakId: 'r1', kodeLokasi: 'A-01-02', namaLokasi: 'A-01 Lantai 2', createdAt: '2026-01-05T08:31:00Z' },
  { id: 'l3', rakId: 'r2', kodeLokasi: 'A-02-01', namaLokasi: 'A-02 Lantai 1', createdAt: '2026-01-05T08:32:00Z' },
  { id: 'l4', rakId: 'r3', kodeLokasi: 'B-01-01', namaLokasi: 'B-01 Pallet Dasar', createdAt: '2026-01-05T08:33:00Z' },
  { id: 'l5', rakId: 'r4', kodeLokasi: 'C-01-01', namaLokasi: 'C-01 Baris Atas', createdAt: '2026-01-05T08:34:00Z' },
  { id: 'l6', rakId: 'r5', kodeLokasi: 'BF-01-01', namaLokasi: 'Buffer Area 1', createdAt: '2026-01-06T08:30:00Z' },
];

const INITIAL_BARCODE: BarcodeItem[] = [
  { id: 'bc1', kodeBarcode: '8991234500017', produkId: 'p1', produkKode: 'FOOD-001', produkNama: 'Makanan Ringan X', createdAt: '2026-01-18T08:00:00Z' },
  { id: 'bc2', kodeBarcode: '8991234500024', produkId: 'p2', produkKode: 'FOOD-002', produkNama: 'Biskuit Gandum Y', createdAt: '2026-01-18T08:10:00Z' },
  { id: 'bc3', kodeBarcode: '8991234500031', produkId: 'p3', produkKode: 'FOOD-003', produkNama: 'Minuman Soda Z', createdAt: '2026-01-18T08:20:00Z' },
  { id: 'bc4', kodeBarcode: '8991234500048', produkId: 'p4', produkKode: 'MAT-001', produkNama: 'Tepung Terigu Serbaguna', createdAt: '2026-01-18T08:30:00Z' },
  { id: 'bc5', kodeBarcode: '8991234500055', produkId: 'p5', produkKode: 'PKG-001', produkNama: 'Kardus Master Box 50x40', createdAt: '2026-01-18T08:40:00Z' },
];

const INITIAL_PERSEDIAAN: StokItem[] = [
  {
    id: 'stk1',
    produkId: 'p1',
    produkKode: 'FOOD-001',
    produkNama: 'Makanan Ringan X',
    satuan: 'PCS',
    jumlahTersedia: 240,
    jumlahDialokasikan: 40,
    jumlahKarantina: 0,
    jumlahWaste: 0,
    minimumStok: 30,
    lokasiPenyimpanan: 'Gudang Pusat / Rak A-01 / A-01 Lantai 1',
    updatedAt: '2026-02-05T08:00:00Z',
  },
  {
    id: 'stk2',
    produkId: 'p2',
    produkKode: 'FOOD-002',
    produkNama: 'Biskuit Gandum Y',
    satuan: 'PCS',
    jumlahTersedia: 35,
    jumlahDialokasikan: 0,
    jumlahKarantina: 0,
    jumlahWaste: 0,
    minimumStok: 40,
    lokasiPenyimpanan: 'Gudang Pusat / Rak A-02 / A-02 Lantai 1',
    updatedAt: '2026-02-05T08:00:00Z',
  },
  {
    id: 'stk3',
    produkId: 'p3',
    produkKode: 'FOOD-003',
    produkNama: 'Minuman Soda Z',
    satuan: 'PCS',
    jumlahTersedia: 15,
    jumlahDialokasikan: 0,
    jumlahKarantina: 0,
    jumlahWaste: 0,
    minimumStok: 20,
    lokasiPenyimpanan: 'Gudang Pusat / Rak B-01 / B-01 Pallet Dasar',
    updatedAt: '2026-02-05T08:00:00Z',
  },
  {
    id: 'stk4',
    produkId: 'p4',
    produkKode: 'MAT-001',
    produkNama: 'Tepung Terigu Serbaguna',
    satuan: 'KG',
    jumlahTersedia: 150,
    jumlahDialokasikan: 25,
    jumlahKarantina: 0,
    jumlahWaste: 0,
    minimumStok: 50,
    lokasiPenyimpanan: 'Gudang Pusat / Rak C-01 / C-01 Baris Atas',
    updatedAt: '2026-02-05T08:00:00Z',
  },
  {
    id: 'stk5',
    produkId: 'p5',
    produkKode: 'PKG-001',
    produkNama: 'Kardus Master Box 50x40',
    satuan: 'PCS',
    jumlahTersedia: 300,
    jumlahDialokasikan: 0,
    jumlahKarantina: 0,
    jumlahWaste: 0,
    minimumStok: 100,
    lokasiPenyimpanan: 'Gudang Pusat / Rak Buffer 1 / Buffer Area 1',
    updatedAt: '2026-02-05T08:00:00Z',
  },
];

const INITIAL_OPNAME: PerhitunganStok[] = [
  {
    id: 'so1',
    nomor: 'SO-CNT-2026-0001',
    tanggal: '2026-02-05T08:00:00Z',
    produkId: 'p1',
    produkKode: 'FOOD-001',
    produkNama: 'Makanan Ringan X',
    satuan: 'PCS',
    lokasiPenyimpanan: 'Gudang Pusat / Rak A-01 / A-01 Lantai 1',
    jumlahSistem: 240,
    status: 'ditugaskan',
    createdAt: '2026-02-05T08:00:00Z',
    updatedAt: '2026-02-05T08:00:00Z',
  },
  {
    id: 'so2',
    nomor: 'SO-CNT-2026-0002',
    tanggal: '2026-02-04T09:00:00Z',
    produkId: 'p2',
    produkKode: 'FOOD-002',
    produkNama: 'Biskuit Gandum Y',
    satuan: 'PCS',
    lokasiPenyimpanan: 'Gudang Pusat / Rak A-02 / A-02 Lantai 1',
    jumlahSistem: 35,
    jumlahFisik: 32,
    selisih: -3,
    adaSelisih: true,
    barangBermasalah: true,
    catatanPenyebab: '3 bungkus kemasan rusak berlubang digigit hama saat inspeksi rak',
    status: 'menunggu_persetujuan',
    createdAt: '2026-02-04T09:00:00Z',
    updatedAt: '2026-02-04T14:30:00Z',
  },
];

const INITIAL_TASKS: UserTask[] = [
  {
    id: 'tsk1',
    nomorTugas: 'TSK-001',
    tipe: 'penerimaan',
    judul: 'Penerimaan & Cek Faktur PO-2026-0001',
    deskripsi: 'Barang dari PT Sumber Pangan Sejahtera telah tiba. Lakukan pencocokan faktur.',
    referensiId: 'po1',
    referensiNomor: 'PO-2026-0001',
    status: 'tertunda',
    prioritas: 'tinggi',
    assignee: 'Andi Saputra',
    targetUrl: '/barang-masuk/penerimaan',
    createdAt: '2026-02-02T09:00:00Z',
  },
  {
    id: 'tsk2',
    nomorTugas: 'TSK-002',
    tipe: 'penyimpanan',
    judul: 'Putaway Kardus Master Box PO-2026-0004',
    deskripsi: '200 PCS Kardus Master Box telah lolos QC. Tempatkan ke lokasi rak gudang.',
    referensiId: 'po4',
    referensiNomor: 'PO-2026-0004',
    status: 'tertunda',
    prioritas: 'sedang',
    assignee: 'Andi Saputra',
    targetUrl: '/barang-masuk/penyimpanan',
    createdAt: '2026-02-04T14:00:00Z',
  },
  {
    id: 'tsk3',
    nomorTugas: 'TSK-003',
    tipe: 'pengambilan',
    judul: 'Picking Pesanan Cabang SO-2026-0001',
    deskripsi: 'Ambil 40 PCS Makanan Ringan X dari Rak A-01-01 untuk Cabang Bandung.',
    referensiId: 'pc1',
    referensiNomor: 'SO-2026-0001',
    status: 'tertunda',
    prioritas: 'tinggi',
    assignee: 'Andi Saputra',
    targetUrl: '/barang-keluar/pengambilan',
    createdAt: '2026-02-04T09:30:00Z',
  },
  {
    id: 'tsk4',
    nomorTugas: 'TSK-004',
    tipe: 'packing',
    judul: 'Packing Pesanan Cabang SO-2026-0004',
    deskripsi: 'Barang telah selesai diambil. Lakukan scan barcode dan kemas rapi.',
    referensiId: 'pc4',
    referensiNomor: 'SO-2026-0004',
    status: 'tertunda',
    prioritas: 'sedang',
    assignee: 'Andi Saputra',
    targetUrl: '/operasional/packing',
    createdAt: '2026-02-03T15:00:00Z',
  },
  {
    id: 'tsk5',
    nomorTugas: 'TSK-005',
    tipe: 'perhitungan_stok',
    judul: 'Stock Opname Fisik Makanan Ringan X',
    deskripsi: 'Lakukan perhitungan fisik di Rak A-01-01 dan input hasil hitung.',
    referensiId: 'so1',
    referensiNomor: 'SO-CNT-2026-0001',
    status: 'tertunda',
    prioritas: 'tinggi',
    assignee: 'Andi Saputra',
    targetUrl: '/pengendalian/perhitungan-stok',
    createdAt: '2026-02-05T08:00:00Z',
  },
  {
    id: 'tsk6',
    nomorTugas: 'TSK-006',
    tipe: 'persetujuan',
    judul: 'Persetujuan Penyesuaian Stok SO-CNT-2026-0002',
    deskripsi: 'Selisih -3 PCS Biskuit Gandum Y karena kemasan rusak. Tinjau & putuskan persetujuan.',
    referensiId: 'so2',
    referensiNomor: 'SO-CNT-2026-0002',
    status: 'tertunda',
    prioritas: 'tinggi',
    assignee: 'Andi Saputra',
    targetUrl: '/pengendalian/perhitungan-stok',
    createdAt: '2026-02-04T14:30:00Z',
  },
];

// ----------------------------------------------------------------------------
// SAFE LOCALSTORAGE HELPERS
// ----------------------------------------------------------------------------

function getStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`Failed to read from localStorage key: ${key}`, err);
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed to write to localStorage key: ${key}`, err);
  }
}

const LATENCY_MS = 250;
export function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), LATENCY_MS));
}

// ----------------------------------------------------------------------------
// EXPORTED STORAGE GETTERS & SETTERS
// ----------------------------------------------------------------------------

export const storage = {
  // Satuan Barang
  getSatuan: (): SatuanBarang[] => getStored<SatuanBarang[]>(STORAGE_KEYS.SATUAN, INITIAL_SATUAN),
  setSatuan: (data: SatuanBarang[]): void => setStored(STORAGE_KEYS.SATUAN, data),

  // Produk
  getProduk: (): Produk[] => getStored<Produk[]>(STORAGE_KEYS.PRODUK, INITIAL_PRODUK),
  setProduk: (data: Produk[]): void => setStored(STORAGE_KEYS.PRODUK, data),

  // Pemasok
  getPemasok: (): Pemasok[] => getStored<Pemasok[]>(STORAGE_KEYS.PEMASOK, INITIAL_PEMASOK),
  setPemasok: (data: Pemasok[]): void => setStored(STORAGE_KEYS.PEMASOK, data),

  // Cabang
  getCabang: (): Cabang[] => getStored<Cabang[]>(STORAGE_KEYS.CABANG, INITIAL_CABANG),
  setCabang: (data: Cabang[]): void => setStored(STORAGE_KEYS.CABANG, data),

  // Gudang & Lokasi Hierarki
  getGudang: (): Gudang[] => getStored<Gudang[]>(STORAGE_KEYS.GUDANG, INITIAL_GUDANG),
  setGudang: (data: Gudang[]): void => setStored(STORAGE_KEYS.GUDANG, data),

  getRak: (): Rak[] => getStored<Rak[]>(STORAGE_KEYS.RAK, INITIAL_RAK),
  setRak: (data: Rak[]): void => setStored(STORAGE_KEYS.RAK, data),

  getLokasi: (): LokasiPenyimpanan[] => getStored<LokasiPenyimpanan[]>(STORAGE_KEYS.LOKASI, INITIAL_LOKASI),
  setLokasi: (data: LokasiPenyimpanan[]): void => setStored(STORAGE_KEYS.LOKASI, data),

  // Barcode
  getBarcode: (): BarcodeItem[] => getStored<BarcodeItem[]>(STORAGE_KEYS.BARCODE, INITIAL_BARCODE),
  setBarcode: (data: BarcodeItem[]): void => setStored(STORAGE_KEYS.BARCODE, data),

  // Persediaan (Inventory Ledger)
  getPersediaan: (): StokItem[] => getStored<StokItem[]>(STORAGE_KEYS.PERSEDIAAN, INITIAL_PERSEDIAAN),
  setPersediaan: (data: StokItem[]): void => setStored(STORAGE_KEYS.PERSEDIAAN, data),

  // Stock Opname
  getOpname: (): PerhitunganStok[] => getStored<PerhitunganStok[]>(STORAGE_KEYS.OPNAME, INITIAL_OPNAME),
  setOpname: (data: PerhitunganStok[]): void => setStored(STORAGE_KEYS.OPNAME, data),

  // User Tasks (Tugas Saya)
  getTasks: (): UserTask[] => getStored<UserTask[]>(STORAGE_KEYS.TASKS, INITIAL_TASKS),
  setTasks: (data: UserTask[]): void => setStored(STORAGE_KEYS.TASKS, data),

  // Reset to seed data
  resetAll: (): void => {
    localStorage.clear();
  },
};
