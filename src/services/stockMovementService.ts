import type { StockMovement } from '../types/stockMovement';
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

export async function fetchStockMovements(): Promise<StockMovement[]> {
  const [resMov, pos, sos] = await Promise.all([
    fetch(`${getApiBase()}/operasional/stock-movement`, { headers: authHeaders() }).then(handleResponse),
    fetchAllPO(),
    fetchAllPesananCabang(),
  ]);

  const unit = localStorage.getItem('wms_unit_bisnis');
  const isEvent = unit === 'KERIPIK_BUJANGAN' || unit === 'BURGER_CHILL';
  const destLabel = isEvent ? 'Event' : 'Cabang';

  return (resMov as any[]).map((m: any) => {
    let sumberOverride = m.lokasiAsal;
    let tujuanOverride = m.lokasiTujuan;
    const ref = m.nomorDokumen ?? m.referensi ?? '';

    if (!sumberOverride || !tujuanOverride || sumberOverride === '-' || tujuanOverride === '-') {
      if (m.tipe === 'masuk') {
        const po = pos.find((p) => p.nomorPO === ref);
        sumberOverride = po ? `Pemasok ${po.pemasokNama}` : 'Pemasok';
        tujuanOverride = 'Gudang Pusat';
      } else if (m.tipe === 'keluar') {
        const so = sos.find((s) => s.nomorPesanan === ref);
        sumberOverride = 'Gudang Pusat';
        tujuanOverride = so ? `${destLabel} ${so.cabangNama}` : destLabel;
      } else if (m.tipe === 'retur') {
        sumberOverride = destLabel;
        tujuanOverride = 'Gudang Pusat';
      } else if (m.tipe === 'waste') {
        sumberOverride = 'Gudang Pusat';
        tujuanOverride = 'Pembuangan / Waste';
      } else if (m.tipe === 'penyesuaian') {
        sumberOverride = 'Sistem';
        tujuanOverride = 'Gudang Pusat';
      }
    }

    return {
      id: m.id,
      timestamp: m.createdAt,
      produkId: m.produkId,
      produkKode: m.produk?.kodeProduk ?? '-',
      produkNama: m.produk?.namaProduk ?? '-',
      jumlah: m.jumlah,
      satuan: m.satuan || m.produk?.satuan?.kode || m.produk?.satuan?.nama || 'PCS',
      tipe: m.tipe,
      sumber: sumberOverride || '-',
      tujuan: tujuanOverride || '-',
      referensi: ref || '-',
      keterangan: m.keterangan ?? undefined,
    };
  });
}
