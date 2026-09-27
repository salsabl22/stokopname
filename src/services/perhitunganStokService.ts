import type { PerhitunganStok } from '../types/perhitunganStok';

import { storage, delay } from './storage';
import { tambahStokManual, fetchStokByProduk } from './persediaanService';
import { createTask, completeTaskByRef } from './taskService';
import { fetchAllPO } from './barangMasukService';
import { fetchAllPesananCabang } from './pesananCabangService';

function genId(): string {
  return `so${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

function nextNomorOpname(): string {
  const year = new Date().getFullYear();
  const list = storage.getOpname();
  const countThisYear = list.filter((item) => item.nomor.includes(String(year))).length + 1;
  return `SO-CNT-${year}-${String(countThisYear).padStart(4, '0')}`;
}

export async function fetchAllPerhitunganStok(): Promise<PerhitunganStok[]> {
  const db = storage.getOpname();
  return delay([...db].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
}

// ---------------------------------------------------------------
// TAHAP 1: Buat Tugas Perhitungan
// ---------------------------------------------------------------
export async function createTugasPerhitungan(
  produk: any,
  lokasiPenyimpanan: string,
  jumlahSistem: number,
): Promise<PerhitunganStok> {
  const now = new Date().toISOString();
  const nomor = nextNomorOpname();

  const satuanStr = typeof produk.satuan === 'string' ? produk.satuan : (produk.satuan?.kode ?? produk.satuan?.nama ?? 'PCS');

  const newItem: PerhitunganStok = {
    id: genId(),
    nomor,
    tanggal: now,
    produkId: produk.id,
    produkKode: produk.kodeProduk,
    produkNama: produk.namaProduk,
    satuan: satuanStr,
    lokasiPenyimpanan,
    jumlahSistem,
    status: 'ditugaskan',
    createdAt: now,
    updatedAt: now,
  };

  const list = storage.getOpname();
  storage.setOpname([...list, newItem]);

  await createTask({
    tipe: 'perhitungan_stok',
    judul: `Hitung Fisik ${produk.namaProduk}`,
    deskripsi: `Lakukan audit fisik di ${lokasiPenyimpanan} (Sistem: ${jumlahSistem} ${produk.satuan}).`,
    referensiId: newItem.id,
    referensiNomor: newItem.nomor,
    prioritas: 'tinggi',
    targetUrl: '/pengendalian/perhitungan-stok',
  });

  return delay(newItem);
}

// ---------------------------------------------------------------
// TAHAP 2: Input Hasil Hitung Fisik
// ---------------------------------------------------------------
export async function inputHasilHitung(
  id: string,
  jumlahFisik: number,
  jumlahSistemTerkini?: number,
): Promise<PerhitunganStok> {
  const list = storage.getOpname();
  const target = list.find((item) => item.id === id);
  if (!target) throw new Error('Data perhitungan stok tidak ditemukan.');

  // Jika ada nilai stok terkini (real-time dari API), gunakan itu.
  // Ini memastikan selisih dihitung terhadap stok BERSIH saat ini,
  // bukan snapshot lama yang dicatat saat tugas dibuat.
  const jumlahSistemAcuan =
    jumlahSistemTerkini !== undefined ? jumlahSistemTerkini : target.jumlahSistem;

  const selisih = jumlahFisik - jumlahSistemAcuan;
  const adaSelisih = selisih !== 0;
  const now = new Date().toISOString();

  let nextStatus: PerhitunganStok['status'];
  if (!adaSelisih) {
    nextStatus = 'tidak_ada_selisih';
  } else {
    nextStatus = 'menunggu_investigasi';
  }

  const updated: PerhitunganStok = {
    ...target,
    jumlahSistem: jumlahSistemAcuan, // simpan nilai terkini agar tabel konsisten
    jumlahFisik,
    selisih,
    adaSelisih,
    status: nextStatus,
    updatedAt: now,
  };

  const updatedList = list.map((item) => (item.id === id ? updated : item));
  storage.setOpname(updatedList);
  await completeTaskByRef(id);

  if (adaSelisih) {
    await createTask({
      tipe: 'perhitungan_stok',
      judul: `Investigasi Selisih ${target.nomor}`,
      deskripsi: `Ditemukan selisih (${selisih > 0 ? '+' : ''}${selisih} ${target.satuan}) pada ${target.produkNama}. Lakukan investigasi.`,
      referensiId: target.id,
      referensiNomor: target.nomor,
      prioritas: 'tinggi',
      targetUrl: '/pengendalian/perhitungan-stok',
    });
  }

  return delay(updated);
}

// ---------------------------------------------------------------
// TAHAP 3: Investigasi
// ---------------------------------------------------------------
export async function submitInvestigasi(
  id: string,
  barangBermasalah: boolean,
  catatanPenyebab: string,
): Promise<PerhitunganStok> {
  const list = storage.getOpname();
  const target = list.find((item) => item.id === id);
  if (!target) throw new Error('Data perhitungan stok tidak ditemukan.');

  const now = new Date().toISOString();
  const updated: PerhitunganStok = {
    ...target,
    barangBermasalah,
    catatanPenyebab: catatanPenyebab.trim(),
    status: 'menunggu_persetujuan',
    updatedAt: now,
  };

  const updatedList = list.map((item) => (item.id === id ? updated : item));
  storage.setOpname(updatedList);
  await completeTaskByRef(id);

  // Buat task untuk Persetujuan Manajerial
  await createTask({
    tipe: 'persetujuan',
    judul: `Persetujuan Penyesuaian ${target.nomor}`,
    deskripsi: `Hasil investigasi selisih ${target.produkNama} (${target.selisih} ${target.satuan}). Putuskan persetujuan penyesuaian.`,
    referensiId: target.id,
    referensiNomor: target.nomor,
    prioritas: 'tinggi',
    targetUrl: '/pengendalian/perhitungan-stok',
  });

  return delay(updated);
}

// ---------------------------------------------------------------
// TAHAP 4: Persetujuan & Penyesuaian Persediaan
// ---------------------------------------------------------------
export async function submitPersetujuan(
  id: string,
  disetujui: boolean,
  catatanPersetujuan?: string,
): Promise<PerhitunganStok> {
  const list = storage.getOpname();
  const target = list.find((item) => item.id === id);
  if (!target) throw new Error('Data perhitungan stok tidak ditemukan.');

  const now = new Date().toISOString();
  const updated: PerhitunganStok & { catatanPersetujuan?: string } = {
    ...target,
    catatanPersetujuan: catatanPersetujuan?.trim(),
    status: disetujui ? 'disetujui' : 'ditolak',
    updatedAt: now,
  };

  const updatedList = list.map((item) => (item.id === id ? updated : item));
  storage.setOpname(updatedList);
  await completeTaskByRef(id);

  // Jika disetujui, update stok persediaan dan catat movement
  if (disetujui && target.selisih !== undefined && target.selisih !== 0) {
    await tambahStokManual(target.produkId, target.selisih, `Penyesuaian hasil perhitungan stok ${target.nomor}`.trim());
  }

  return delay(updated);
}

// ---------------------------------------------------------------
// ALIAS UNTUK KOMPATIBILITAS (Existing Pages)
// ---------------------------------------------------------------

export async function hitungStokSistemRealtime(produkId: string): Promise<number> {
  const pos = await fetchAllPO();
  let totalMasuk = 0;
  for (const po of pos) {
    if (['disimpan', 'menunggu_qc', 'perlu_repack', 'siap_penyimpanan', 'barang_datang'].includes(po.status)) {
      for (const item of po.items) {
        if (item.produkId === produkId) {
          totalMasuk += (item.jumlahDiterima ?? item.jumlahPesan);
        }
      }
    }
  }

  const sos = await fetchAllPesananCabang();
  let totalKeluar = 0;
  for (const so of sos) {
    if (!['dibatalkan', 'ditolak', 'gagal_kirim'].includes(so.status)) {
      for (const item of so.items) {
        if (item.produkId === produkId) {
          totalKeluar += (item.jumlahDiambil ?? item.jumlahDipesan);
        }
      }
    }
  }

  return Math.max(0, totalMasuk - totalKeluar);
}

export const buatTugasPerhitungan = async (
  produkId: string,
  produkKode: string,
  produkNama: string,
  satuan: string,
) => {
  const jumlahSistem = await hitungStokSistemRealtime(produkId);
  
  const stok = await fetchStokByProduk(produkId);
  const lokasiPenyimpanan = stok?.lokasiPenyimpanan || 'Rak A1';

  const produk = { id: produkId, kodeProduk: produkKode, namaProduk: produkNama, satuan };
  return createTugasPerhitungan(produk, lokasiPenyimpanan, jumlahSistem);
};
export const bukaInvestigasiUlang = async (id: string) => {
  const list = storage.getOpname();
  const target = list.find((item) => item.id === id);
  if (!target) throw new Error('Data tidak ditemukan');
  const updated: PerhitunganStok = { ...target, status: 'menunggu_investigasi', updatedAt: new Date().toISOString() };
  storage.setOpname(list.map((item) => (item.id === id ? updated : item)));
  return delay(updated);
};
export const prosesInvestigasi = submitInvestigasi;
export const prosesPersetujuan = submitPersetujuan;
