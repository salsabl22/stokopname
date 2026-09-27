/**
 * Penjualan Cabang Service — khusus Fotosnaps
 * Mengelola data penjualan harian per cabang (barang keluar dari cabang ke konsumen)
 */

const STORAGE_KEY = 'wms_penjualan_cabang';

export interface PenjualanCabangItem {
  produkId: string;
  produkNama: string;
  produkKode: string;
  jumlah: number;
  satuan: string;
}

export interface PenjualanCabang {
  id: string;
  tanggal: string; // ISO date string
  cabangId: string;
  cabangNama: string;
  items: PenjualanCabangItem[];
  catatan?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PenjualanCabangFormValues {
  tanggal: string;
  cabangId: string;
  catatan?: string;
  items: {
    produkId: string;
    jumlah: string;
    satuan: string;
  }[];
}

function generateId(): string {
  return `pjc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function loadAll(): PenjualanCabang[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAll(list: PenjualanCabang[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export async function fetchPenjualanCabang(): Promise<PenjualanCabang[]> {
  return loadAll();
}

export async function fetchPenjualanCabangByRange(
  startDate: string,
  endDate: string,
): Promise<PenjualanCabang[]> {
  const all = loadAll();
  return all.filter((p) => {
    const d = p.tanggal.slice(0, 10);
    return d >= startDate && d <= endDate;
  });
}

export async function createPenjualanCabang(
  values: PenjualanCabangFormValues,
  cabangNama: string,
  produkMap: Record<string, { nama: string; kode: string }>,
): Promise<PenjualanCabang> {
  const all = loadAll();
  const now = new Date().toISOString();

  const items: PenjualanCabangItem[] = values.items
    .filter((it) => it.produkId && Number(it.jumlah) > 0)
    .map((it) => ({
      produkId: it.produkId,
      produkNama: produkMap[it.produkId]?.nama ?? '-',
      produkKode: produkMap[it.produkId]?.kode ?? '-',
      jumlah: Number(it.jumlah),
      satuan: it.satuan,
    }));

  const record: PenjualanCabang = {
    id: generateId(),
    tanggal: values.tanggal,
    cabangId: values.cabangId,
    cabangNama,
    items,
    catatan: values.catatan,
    createdAt: now,
    updatedAt: now,
  };

  all.push(record);
  saveAll(all);
  return record;
}

export async function updatePenjualanCabang(
  id: string,
  values: PenjualanCabangFormValues,
  cabangNama: string,
  produkMap: Record<string, { nama: string; kode: string }>,
): Promise<PenjualanCabang> {
  const all = loadAll();
  const idx = all.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error('Data penjualan tidak ditemukan');

  const items: PenjualanCabangItem[] = values.items
    .filter((it) => it.produkId && Number(it.jumlah) > 0)
    .map((it) => ({
      produkId: it.produkId,
      produkNama: produkMap[it.produkId]?.nama ?? '-',
      produkKode: produkMap[it.produkId]?.kode ?? '-',
      jumlah: Number(it.jumlah),
      satuan: it.satuan,
    }));

  const updated: PenjualanCabang = {
    ...all[idx],
    tanggal: values.tanggal,
    cabangId: values.cabangId,
    cabangNama,
    items,
    catatan: values.catatan,
    updatedAt: new Date().toISOString(),
  };

  all[idx] = updated;
  saveAll(all);
  return updated;
}

export async function deletePenjualanCabang(id: string): Promise<void> {
  const all = loadAll().filter((p) => p.id !== id);
  saveAll(all);
}

/**
 * Agregasi: jumlah penjualan per produk per cabang
 * Returns: { cabangId -> { produkId -> totalJual } }
 */
export function aggregatePenjualanByCabangDanProduk(
  records: PenjualanCabang[],
): Record<string, Record<string, number>> {
  const result: Record<string, Record<string, number>> = {};
  for (const rec of records) {
    if (!result[rec.cabangId]) result[rec.cabangId] = {};
    for (const item of rec.items) {
      result[rec.cabangId][item.produkId] =
        (result[rec.cabangId][item.produkId] ?? 0) + item.jumlah;
    }
  }
  return result;
}

/**
 * Agregasi: total penjualan per produk dari semua cabang
 */
export function aggregatePenjualanByProduk(
  records: PenjualanCabang[],
): Record<string, number> {
  const result: Record<string, number> = {};
  for (const rec of records) {
    for (const item of rec.items) {
      result[item.produkId] = (result[item.produkId] ?? 0) + item.jumlah;
    }
  }
  return result;
}
