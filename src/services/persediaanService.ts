/**
 * Persediaan Service — terhubung ke backend real API (Inventory).
 * getApiBase() dipanggil saat tiap request (dynamic) agar unit bisnis
 * terbaca dari localStorage dengan benar.
 */
import type { StokItem } from '../types/persediaan';

function getApiBase(): string {
  const unit = localStorage.getItem('wms_unit_bisnis');
  const path = unit === 'KERIPIK_BUJANGAN' ? 'keripik-bujangan' : 'fotosnaps';
  return `${import.meta.env.VITE_API_URL || ''}/api/${path}`;
}

function getToken(): string {
  return localStorage.getItem('wms_token') || '';
}

function authHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`,
  };
}

async function handleResponse(res: Response) {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request gagal');
  return data;
}

function mapInventory(inv: any): StokItem {
  const rak = inv.lokasi?.rak;
  const gudang = rak?.gudang;
  const lokasiPenyimpanan = inv.lokasi
    ? [gudang?.nama, rak?.kode, inv.lokasi.kode].filter(Boolean).join(' / ')
    : undefined;

  return {
    id: inv.id,
    produkId: inv.produkId,
    produkKode: inv.produk?.kodeProduk ?? '-',
    produkNama: inv.produk?.namaProduk ?? '-',
    satuan: inv.produk?.satuan?.kode ?? inv.produk?.satuan?.nama ?? 'PCS',
    batchNomor: inv.batch?.nomorBatch,
    jumlahTersedia: inv.jumlahTersedia,
    jumlahDialokasikan: inv.jumlahDialokasikan,
    jumlahKarantina: inv.jumlahKarantina,
    jumlahWaste: inv.jumlahWaste,
    minimumStok: inv.minimumStok,
    lokasiPenyimpanan,
    updatedAt: inv.updatedAt,
  };
}

export async function fetchPersediaan(): Promise<StokItem[]> {
  const res = await fetch(`${getApiBase()}/operasional/inventory`, { headers: authHeaders() });
  const data = await handleResponse(res);
  return (data as any[]).map(mapInventory).sort((a, b) => a.produkNama.localeCompare(b.produkNama));
}

export async function fetchStokByProduk(produkId: string): Promise<StokItem | undefined> {
  const list = await fetchPersediaan();
  return list.find((item) => item.produkId === produkId);
}

export async function isStokCukup(produkId: string, jumlah: number): Promise<boolean> {
  const item = await fetchStokByProduk(produkId);
  if (!item) return false;
  return item.jumlahTersedia - item.jumlahDialokasikan >= jumlah;
}

/**
 * Tambah stok manual (mis. dari halaman Pengisian Ulang) lewat mekanisme
 * Stock Adjustment yang sudah ada di backend, diajukan & langsung disetujui.
 */
export async function tambahStokManual(
  produkId: string,
  jumlahTambah: number,
  alasan: string,
  userId?: string,
): Promise<void> {
  const current = await fetchStokByProduk(produkId);
  const jumlahLama = current?.jumlahTersedia ?? 0;
  const jumlahBaru = jumlahLama + jumlahTambah;

  const createRes = await fetch(`${getApiBase()}/pengendalian/adjustment`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ produkId, jumlahLama, jumlahBaru, alasan, pengajuId: userId }),
  });
  const adjustment = await handleResponse(createRes);

  const approveRes = await fetch(`${getApiBase()}/pengendalian/adjustment/${adjustment.id}/approve`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ approved: true, penyetujuId: userId }),
  });
  await handleResponse(approveRes);
}
