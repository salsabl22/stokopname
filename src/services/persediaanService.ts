/**
 * Persediaan Service — terhubung ke backend real API (Inventory).
 * getApiBase() dipanggil saat tiap request (dynamic) agar unit bisnis
 * terbaca dari localStorage dengan benar.
 */
import type { StokItem } from '../types/persediaan';
import { fetchAllPO } from './barangMasukService';
import { fetchAllPesananCabang } from './pesananCabangService';

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
    // Prioritaskan satuan yang tersimpan di inventory record (seharusnya
    // sesuai dengan satuan PO), fallback ke satuan produk jika field kosong.
    satuan: inv.satuan || inv.produk?.satuan?.kode || inv.produk?.satuan?.nama || 'PCS',
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
  const [resInv, pos, sos] = await Promise.all([
    fetch(`${getApiBase()}/operasional/inventory`, { headers: authHeaders() }).then(handleResponse),
    fetchAllPO(),
    fetchAllPesananCabang(),
  ]);
  
  let data = (resInv as any[]).map(mapInventory);

  // Perhitungan real-time: Penyimpanan - Pesanan Cabang
  const poDisimpan = pos.filter((po) => po.status === 'disimpan');
  const soValid = sos.filter((so) => so.status !== 'dibatalkan' && so.status !== 'gagal_kirim');

  data = data.map((inv) => {
    let totalIn = 0;
    poDisimpan.forEach((po) => {
      po.items.forEach((it) => {
        if (it.produkId === inv.produkId) {
          totalIn += (it.jumlahDiterima ?? it.jumlahPesan);
        }
      });
    });

    let totalOut = 0;
    soValid.forEach((so) => {
      so.items.forEach((it) => {
        if (it.produkId === inv.produkId) {
          totalOut += (it.jumlahDipesan || 0);
        }
      });
    });

    return {
      ...inv,
      // override jumlahTersedia dari backend dengan kalkulasi frontend real-time
      jumlahTersedia: totalIn - totalOut,
    };
  });

  return data.sort((a, b) => a.produkNama.localeCompare(b.produkNama));
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
