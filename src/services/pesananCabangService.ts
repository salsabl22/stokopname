import type { PesananCabang, PesananCabangFormValues } from '../types/pesananCabang';
import { createTask, completeTaskByRef } from './taskService';
import type { Produk } from '../types/produk';

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

function mapSO(so: any): PesananCabang {
  return {
    id: so.id,
    nomorPesanan: so.nomorSO,
    tanggal: so.tanggal,
    cabangId: so.cabangId,
    cabangNama: so.cabang?.nama ?? '-',
    items: (so.items || []).map((it: any) => ({
      id: it.id,
      produkId: it.produkId,
      produkKode: it.produk?.kodeProduk ?? '-',
      produkNama: it.produk?.namaProduk ?? '-',
      satuan: it.satuan,
      jumlahDipesan: it.jumlahPesan,
      jumlahDiambil: it.jumlahPick > 0 ? it.jumlahPick : undefined,
    })),
    status: so.status,
    catatan: so.catatan ?? undefined,
    kurir: so.metodePengiriman ?? undefined,
    nomorResi: so.keteranganPengiriman ? so.keteranganPengiriman.replace('No. Resi: ', '') : undefined,
    createdAt: so.createdAt,
    updatedAt: so.updatedAt,
  };
}

export async function fetchAllPesananCabang(): Promise<PesananCabang[]> {
  const res = await fetch(`${getApiBase()}/operasional/sales-order`, { headers: authHeaders() });
  const data = await handleResponse(res);
  return (data as any[]).map(mapSO);
}

export async function fetchPesananCabangByStatus(statuses: PesananCabang['status'][]): Promise<PesananCabang[]> {
  const list = await fetchAllPesananCabang();
  return list.filter((so) => statuses.includes(so.status));
}

export async function createPesananCabang(
  values: PesananCabangFormValues,
  cabangNama: string,
  produkList: Produk[],
): Promise<PesananCabang> {
  const items = values.items.map((it) => {
    const produk = produkList.find((p) => p.id === it.produkId)!;
    return { produkId: produk.id, satuan: produk.satuan?.kode ?? produk.satuanPembelian?.kode ?? '', jumlah: Number(it.jumlah) };
  });

  const res = await fetch(`${getApiBase()}/operasional/sales-order`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ cabangId: values.cabangId, items }),
  });
  const data = await handleResponse(res);
  const so = mapSO(data);

  await createTask({
    tipe: 'pengambilan',
    judul: `Alokasi SO ${so.nomorPesanan}`,
    deskripsi: `Pesanan cabang ${cabangNama} memerlukan alokasi stok.`,
    referensiId: so.id,
    referensiNomor: so.nomorPesanan,
    prioritas: 'tinggi',
    targetUrl: '/barang-keluar/alokasi',
  });

  return so;
}

async function updateStatus(id: string, payload: Record<string, any>): Promise<PesananCabang> {
  const res = await fetch(`${getApiBase()}/operasional/sales-order/${id}/status`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await handleResponse(res);
  return mapSO(data);
}

export async function prosesAlokasi(id: string): Promise<PesananCabang> {
  const updated = await updateStatus(id, { status: 'siap_diambil' });
  await completeTaskByRef(id);

  await createTask({
    tipe: 'pengambilan',
    judul: `Picking SO ${updated.nomorPesanan}`,
    deskripsi: `Ambil barang untuk Pesanan ${updated.nomorPesanan} dari ${updated.cabangNama}.`,
    referensiId: id,
    referensiNomor: updated.nomorPesanan,
    prioritas: 'tinggi',
    targetUrl: '/barang-keluar/pengambilan',
  });

  return updated;
}

export async function prosesPengambilan(
  id: string,
  sudahSesuai: boolean,
  items: { soItemId: string; jumlahDiambil: number }[],
  catatanPengecualian?: string,
): Promise<PesananCabang> {
  if (!sudahSesuai) {
    const updated = await updateStatus(id, { status: 'pengecualian_pengambilan', catatan: catatanPengecualian });
    await completeTaskByRef(id);
    return updated;
  }

  const itemsPicked = items.map((it) => ({ id: it.soItemId, jumlahPick: it.jumlahDiambil }));
  const updated = await updateStatus(id, { status: 'siap_packing', itemsPicked });
  await completeTaskByRef(id);

  await createTask({
    tipe: 'packing',
    judul: `Packing SO ${updated.nomorPesanan}`,
    deskripsi: `Barang SO ${updated.nomorPesanan} siap dikemas.`,
    referensiId: id,
    referensiNomor: updated.nomorPesanan,
    prioritas: 'sedang',
    targetUrl: '/operasional/packing',
  });

  void catatanPengecualian;
  return updated;
}

export async function simpanHasilPacking(
  id: string,
  packingResults: { soItemId: string; satuanKemasan: string; jumlahKemasan: number; sisaJumlah: number }[],
): Promise<PesananCabang> {
  const res = await fetch(`${getApiBase()}/operasional/sales-order/${id}/packing`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ packingResults }),
  });
  await handleResponse(res);

  const list = await fetchAllPesananCabang();
  const updated = list.find((so) => so.id === id)!;
  await completeTaskByRef(id);
  return updated;
}

export async function prosesPengiriman(
  id: string,
  kurir: string,
  nomorResi: string,
  berhasil: boolean,
): Promise<PesananCabang> {
  if (!berhasil) {
    return updateStatus(id, { status: 'gagal_kirim' });
  }

  const updated = await updateStatus(id, {
    status: 'terkirim',
    metodePengiriman: kurir,
    keteranganPengiriman: `No. Resi: ${nomorResi}`,
  });
  await completeTaskByRef(id);
  return updated;
}

export const cobaAlokasiUlang = async (id: string) => prosesAlokasi(id);

export const validasiStokUntukPesanan = async (
  items: { produkId: string; jumlah: number }[],
): Promise<{ produkId: string; cukup: boolean; sisaStok?: number }[]> => {
  const res = await fetch(`${getApiBase()}/operasional/inventory`, { headers: authHeaders() });
  const inventory = await handleResponse(res);

  return items.map((it) => {
    const invs = (inventory as any[]).filter((i) => i.produkId === it.produkId);
    const tersedia = invs.reduce((sum, i) => sum + (i.jumlahTersedia - i.jumlahDialokasikan), 0);
    return { produkId: it.produkId, cukup: tersedia >= it.jumlah, sisaStok: tersedia };
  });
};
