/**
 * Stok Cabang Service — khusus Fotosnaps
 * Menghitung stok cabang: Pengiriman (barang masuk ke cabang) - Penjualan Cabang (barang keluar)
 */

import { fetchAllPesananCabang } from './pesananCabangService';
import { fetchPenjualanCabang, aggregatePenjualanByCabangDanProduk } from './penjualanCabangService';

export interface StokCabangItem {
  produkId: string;
  produkNama: string;
  produkKode: string;
  satuan: string;
  barangMasuk: number;   // dari pengiriman (SO terkirim)
  barangKeluar: number;  // dari penjualan cabang
  sisaStok: number;      // barangMasuk - barangKeluar
}

export interface StokCabang {
  cabangId: string;
  cabangNama: string;
  items: StokCabangItem[];
  totalMasuk: number;
  totalKeluar: number;
  totalSisa: number;
}

/**
 * Hitung stok per cabang berdasarkan pengiriman (SO 'terkirim') dan penjualan cabang.
 * Filter opsional berdasarkan rentang tanggal.
 */
export async function fetchStokCabang(options?: {
  startDate?: string;
  endDate?: string;
}): Promise<StokCabang[]> {
  // Ambil semua pesanan cabang yang sudah terkirim
  const allSO = await fetchAllPesananCabang();
  const soTerkirim = allSO.filter((so) => {
    if (so.status !== 'terkirim') return false;
    if (options?.startDate || options?.endDate) {
      const d = so.tanggal.slice(0, 10);
      if (options.startDate && d < options.startDate) return false;
      if (options.endDate && d > options.endDate) return false;
    }
    return true;
  });

  // Ambil semua penjualan cabang (barang keluar dari cabang)
  const allPenjualan = await fetchPenjualanCabang();
  const penjualanFiltered = allPenjualan.filter((p) => {
    if (options?.startDate || options?.endDate) {
      const d = p.tanggal.slice(0, 10);
      if (options?.startDate && d < options.startDate) return false;
      if (options?.endDate && d > options.endDate) return false;
    }
    return true;
  });

  // Agregasi barang masuk per cabang per produk (dari SO terkirim)
  const masukByCabangProduk: Record<string, Record<string, { jumlah: number; satuan: string; nama: string; kode: string }>> = {};
  for (const so of soTerkirim) {
    if (!masukByCabangProduk[so.cabangId]) {
      masukByCabangProduk[so.cabangId] = {};
    }
    for (const item of so.items) {
      const key = item.produkId;
      if (!masukByCabangProduk[so.cabangId][key]) {
        masukByCabangProduk[so.cabangId][key] = {
          jumlah: 0,
          satuan: item.satuan ?? '-',
          nama: item.produkNama,
          kode: item.produkKode,
        };
      }
      masukByCabangProduk[so.cabangId][key].jumlah +=
        item.jumlahDiambil ?? item.jumlahDipesan;
    }
  }

  // Agregasi barang keluar per cabang per produk (dari penjualan)
  const keluarByCabangProduk = aggregatePenjualanByCabangDanProduk(penjualanFiltered);

  // Kumpulkan semua cabang yang ada di pengiriman atau penjualan
  const cabangMap: Record<string, string> = {};
  for (const so of soTerkirim) {
    cabangMap[so.cabangId] = so.cabangNama;
  }
  for (const p of penjualanFiltered) {
    cabangMap[p.cabangId] = p.cabangNama;
  }

  const result: StokCabang[] = [];

  for (const [cabangId, cabangNama] of Object.entries(cabangMap)) {
    const produkMasuk = masukByCabangProduk[cabangId] ?? {};
    const produkKeluar = keluarByCabangProduk[cabangId] ?? {};

    // Kumpulkan semua produkId yang pernah masuk atau keluar di cabang ini
    const allProdukIds = new Set([
      ...Object.keys(produkMasuk),
      ...Object.keys(produkKeluar),
    ]);

    const items: StokCabangItem[] = [];
    for (const produkId of allProdukIds) {
      const masuk = produkMasuk[produkId]?.jumlah ?? 0;
      const keluar = produkKeluar[produkId] ?? 0;

      // Cari info produk dari sumber yang tersedia
      const info = produkMasuk[produkId] ?? {
        satuan: '-',
        nama: '-',
        kode: '-',
      };

      // Juga cari dari penjualan untuk nama/kode jika tidak ada di masuk
      const penjualanRecord = penjualanFiltered.find(
        (p) => p.cabangId === cabangId && p.items.some((i) => i.produkId === produkId),
      );
      const penjualanItem = penjualanRecord?.items.find((i) => i.produkId === produkId);

      items.push({
        produkId,
        produkNama: info.nama !== '-' ? info.nama : penjualanItem?.produkNama ?? '-',
        produkKode: info.kode !== '-' ? info.kode : penjualanItem?.produkKode ?? '-',
        satuan: info.satuan !== '-' ? info.satuan : penjualanItem?.satuan ?? '-',
        barangMasuk: masuk,
        barangKeluar: keluar,
        sisaStok: masuk - keluar,
      });
    }

    const totalMasuk = items.reduce((s, i) => s + i.barangMasuk, 0);
    const totalKeluar = items.reduce((s, i) => s + i.barangKeluar, 0);

    result.push({
      cabangId,
      cabangNama,
      items: items.sort((a, b) => a.produkNama.localeCompare(b.produkNama)),
      totalMasuk,
      totalKeluar,
      totalSisa: totalMasuk - totalKeluar,
    });
  }

  return result.sort((a, b) => a.cabangNama.localeCompare(b.cabangNama));
}
