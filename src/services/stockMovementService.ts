import type { StockMovement } from '../types/stockMovement';

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

function mapMovement(m: any): StockMovement {
  return {
    id: m.id,
    timestamp: m.createdAt,
    produkId: m.produkId,
    produkKode: m.produk?.kodeProduk ?? '-',
    produkNama: m.produk?.namaProduk ?? '-',
    jumlah: m.jumlah,
    satuan: m.produk?.satuan?.kode ?? m.produk?.satuan?.nama ?? 'PCS',
    tipe: m.tipe,
    sumber: m.lokasiAsal ?? '-',
    tujuan: m.lokasiTujuan ?? '-',
    referensi: m.nomorDokumen ?? m.referensi ?? '-',
    keterangan: m.keterangan ?? undefined,
  };
}

export async function fetchStockMovements(): Promise<StockMovement[]> {
  const res = await fetch(`${getApiBase()}/operasional/stock-movement`, { headers: authHeaders() });
  const data = await handleResponse(res);
  return (data as any[]).map(mapMovement);
}
