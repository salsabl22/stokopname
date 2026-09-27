import type { HasilQC, PesananPembelian, PesananPembelianFormValues } from '../types/barangMasuk';
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

function mapPO(po: any): PesananPembelian {
  return {
    id: po.id,
    nomorPO: po.nomorPO,
    tanggal: po.tanggal,
    pemasokId: po.pemasokId,
    pemasokNama: po.pemasok?.nama ?? '-',
    items: (po.items || []).map((it: any) => ({
      id: it.id,
      produkId: it.produkId,
      produkKode: it.produk?.kodeProduk ?? '-',
      produkNama: it.produk?.namaProduk ?? '-',
      // Prioritaskan satuan yang tersimpan di item PO (yang di-input user),
      // fallback ke satuan produk jika kosong.
      satuan: it.satuan || it.produk?.satuan?.kode || it.produk?.satuan?.nama || 'PCS',
      jumlahPesan: it.jumlahPesan,
      hargaSatuan: it.hargaSatuan,
      jumlahDiterima: it.jumlahDiterima ?? undefined,
    })),
    totalPesanan: po.totalPesanan,
    status: po.status,
    barangSesuai: po.barangSesuai ?? undefined,
    jumlahSesuai: po.jumlahSesuai ?? undefined,
    catatanSelisih: po.catatanSelisih ?? undefined,
    hasilQC: po.hasilQC ?? undefined,
    perluRepack: po.perluRepack ?? undefined,
    catatanQC: po.catatanQC ?? undefined,
    lokasiPenyimpanan: po.lokasiPenyimpanan ?? undefined,
    createdAt: po.createdAt,
    updatedAt: po.updatedAt,
  };
}

export async function fetchAllPO(): Promise<PesananPembelian[]> {
  const res = await fetch(`${getApiBase()}/purchase-order`, { headers: authHeaders() });
  const data = await handleResponse(res);
  return (data as any[]).map(mapPO);
}

export async function fetchPOByStatus(statuses: PesananPembelian['status'][]): Promise<PesananPembelian[]> {
  const list = await fetchAllPO();
  return list.filter((po) => statuses.includes(po.status));
}

export async function createPesananPembelian(
  values: PesananPembelianFormValues,
  _pemasokNama: string,
  produkList: Produk[],
): Promise<PesananPembelian> {
  const items = values.items.map((it) => {
    const produk = produkList.find((p) => p.id === it.produkId)!;
    return {
      produkId: produk.id,
      // Gunakan satuan yang dipilih user di form, fallback ke satuan produk
      satuan: it.satuan || produk.satuan?.kode || produk.satuanPembelian?.kode || 'PCS',
      jumlahPesan: Number(it.jumlah),
      hargaSatuan: Number(it.hargaSatuan),
    };
  });

  const res = await fetch(`${getApiBase()}/purchase-order`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ pemasokId: values.pemasokId, items }),
  });
  const data = await handleResponse(res);
  const po = mapPO(data);

  await createTask({
    tipe: 'penerimaan',
    judul: `Terima PO ${po.nomorPO}`,
    deskripsi: `Pesanan pembelian ${po.nomorPO} dari ${po.pemasokNama} menunggu penerimaan.`,
    referensiId: po.id,
    referensiNomor: po.nomorPO,
    prioritas: 'sedang',
    targetUrl: '/barang-masuk/penerimaan',
  });

  return po;
}

async function updateStatus(id: string, payload: Record<string, any>): Promise<PesananPembelian> {
  const res = await fetch(`${getApiBase()}/purchase-order/${id}/status`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await handleResponse(res);
  return mapPO(data);
}

export async function tandaiBarangDatang(id: string): Promise<void> {
  await updateStatus(id, { status: 'barang_datang' });
}

export async function updatePOStatus(id: string, status: PesananPembelian['status']): Promise<void> {
  await updateStatus(id, { status });
}

export async function prosesPenerimaan(
  id: string,
  barangSesuai: boolean,
  jumlahDiterimaPerItem: Record<string, number>,
  catatanSelisih?: string,
): Promise<PesananPembelian> {
  const current = await fetchAllPO();
  const target = current.find((po) => po.id === id);
  if (!target) throw new Error('PO tidak ditemukan');

  const itemsReceived = target.items.map((it) => ({
    id: it.id,
    jumlahDiterima: jumlahDiterimaPerItem[it.id] ?? it.jumlahPesan,
  }));
  const jumlahSesuai = itemsReceived.every((it, idx) => it.jumlahDiterima === target.items[idx].jumlahPesan);

  const updated = await updateStatus(id, {
    status: barangSesuai ? 'menunggu_qc' : 'pengecualian',
    barangSesuai,
    jumlahSesuai,
    catatanSelisih,
    itemsReceived,
  });

  await completeTaskByRef(id);
  if (barangSesuai) {
    await createTask({
      tipe: 'penyimpanan',
      judul: `QC Barang ${target.nomorPO}`,
      deskripsi: `Barang dari ${target.pemasokNama} telah diterima. Lakukan pemeriksaan kualitas.`,
      referensiId: id,
      referensiNomor: target.nomorPO,
      prioritas: 'tinggi',
      targetUrl: '/barang-masuk/pemeriksaan-kualitas',
    });
  }

  return updated;
}

export async function prosesQC(
  id: string,
  hasilQC: HasilQC,
  perluRepack: boolean,
  catatanQC?: string,
): Promise<PesananPembelian> {
  let nextStatus: PesananPembelian['status'];
  if (hasilQC === 'rusak') nextStatus = 'karantina';
  else if (hasilQC === 'ditolak') nextStatus = 'retur';
  else nextStatus = perluRepack ? 'perlu_repack' : 'siap_penyimpanan';

  const updated = await updateStatus(id, { status: nextStatus, hasilQC, perluRepack, catatanQC });
  await completeTaskByRef(id);

  if (nextStatus === 'siap_penyimpanan') {
    await createTask({
      tipe: 'penyimpanan',
      judul: `Putaway ${updated.nomorPO}`,
      deskripsi: `Barang ${updated.nomorPO} lolos QC. Simpan ke gudang.`,
      referensiId: id,
      referensiNomor: updated.nomorPO,
      prioritas: 'sedang',
      targetUrl: '/barang-masuk/penyimpanan',
    });
  }

  return updated;
}

export async function tandaiRepackSelesai(id: string): Promise<void> {
  await updateStatus(id, { status: 'siap_penyimpanan' });
}

export async function simpanKeGudang(id: string, lokasiPenyimpanan: string): Promise<void> {
  await updateStatus(id, { status: 'disimpan', lokasiPenyimpanan });
  await completeTaskByRef(id);
}
