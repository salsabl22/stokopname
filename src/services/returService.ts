import type { KondisiBarangRetur, Retur, ReturFormValues } from '../types/retur';
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

function mapRetur(r: any): Retur {
  return {
    id: r.id,
    nomorRetur: r.nomorRetur,
    tanggal: r.tanggalPengajuan,
    sumber: r.cabangId ? 'cabang' : 'internal',
    cabangId: r.cabangId ?? undefined,
    cabangNama: r.cabang?.nama ?? undefined,
    poId: r.poId ?? undefined,
    poNomor: undefined,
    pemasokNama: undefined,
    items: (r.items || []).map((it: any) => ({
      id: it.id,
      produkId: it.produkId,
      produkKode: it.produk?.kodeProduk ?? '-',
      produkNama: it.produk?.namaProduk ?? '-',
      satuan: it.satuan,
      jumlah: it.jumlah,
    })),
    alasan: r.alasan,
    status: r.status,
    catatanPengecualian: r.status === 'pengecualian' ? r.catatan ?? undefined : undefined,
    kondisiBarang: r.kondisi ?? undefined,
    catatanPemeriksaan: r.status !== 'pengecualian' ? r.catatan ?? undefined : undefined,
    fotoKerusakan: r.fotos?.[0]?.filePath,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

export async function fetchAllRetur(): Promise<Retur[]> {
  const res = await fetch(`${getApiBase()}/operasional/retur`, { headers: authHeaders() });
  const data = await handleResponse(res);
  return (data as any[]).map(mapRetur);
}

export async function createRetur(
  values: ReturFormValues,
  meta: { cabangNama?: string; poNomor?: string; pemasokNama?: string },
  _produkList: Produk[],
  _fotoKerusakan?: string,
): Promise<Retur> {
  void meta;
  const items = values.items.map((it) => {
    return {
      produkId: it.produkId,
      satuan: (it as any).satuan || 'PCS',
      jumlah: Number(it.jumlah),
    };
  });

  const res = await fetch(`${getApiBase()}/operasional/retur`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      cabangId: values.sumber === 'cabang' ? values.cabangId : undefined,
      poId: values.sumber === 'internal' ? values.poId : undefined,
      alasan: values.alasan,
      items,
    }),
  });
  const data = await handleResponse(res);
  const retur = mapRetur(data);

  await createTask({
    tipe: 'penerimaan',
    judul: `Terima Retur ${retur.nomorRetur}`,
    deskripsi: `Pengajuan retur ${retur.nomorRetur} menunggu penerimaan gudang.`,
    referensiId: retur.id,
    referensiNomor: retur.nomorRetur,
    prioritas: 'sedang',
    targetUrl: '/barang-keluar/retur',
  });

  return retur;
}

async function updateStatus(id: string, payload: Record<string, any>): Promise<Retur> {
  const res = await fetch(`${getApiBase()}/operasional/retur/${id}/status`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await handleResponse(res);
  return mapRetur(data);
}

export async function prosesPenerimaanRetur(id: string, sesuai: boolean, catatan?: string): Promise<Retur> {
  const nextStatus = sesuai ? 'diterima' : 'pengecualian';
  const updated = await updateStatus(id, { status: nextStatus, catatan });
  await completeTaskByRef(id);

  if (sesuai) {
    await createTask({
      tipe: 'penerimaan',
      judul: `Periksa Retur ${updated.nomorRetur}`,
      deskripsi: `Retur ${updated.nomorRetur} telah diterima sesuai pengajuan. Lakukan pemeriksaan kondisi barang.`,
      referensiId: id,
      referensiNomor: updated.nomorRetur,
      prioritas: 'tinggi',
      targetUrl: '/barang-keluar/retur',
    });
  }

  return updated;
}

export async function prosesPemeriksaanRetur(
  id: string,
  kondisi: KondisiBarangRetur,
  catatan?: string,
  _fotoKerusakan?: string,
): Promise<Retur> {
  let nextStatus: Retur['status'];
  if (kondisi === 'baik') nextStatus = 'kembali_ke_stok';
  else if (kondisi === 'rusak') nextStatus = 'karantina';
  else nextStatus = 'retur_pemasok';

  const updated = await updateStatus(id, { status: nextStatus, kondisi, catatan });
  await completeTaskByRef(id);
  return updated;
}
