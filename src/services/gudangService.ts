import type { Gudang, GudangFormValues, LokasiPenyimpanan, Rak } from '../types/gudang';
import { storage, delay } from './storage';

function genId(prefix: string): string {
  return `${prefix}${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

// ---- GUDANG ----
export async function fetchGudang(): Promise<Gudang[]> {
  return delay(storage.getGudang());
}

export async function isKodeGudangDuplicate(kode: string, excludeId?: string): Promise<boolean> {
  const list = storage.getGudang();
  return list.some(
    (item) => item.kodeGudang.toLowerCase() === kode.trim().toLowerCase() && item.id !== excludeId,
  );
}

export async function createGudang(values: GudangFormValues): Promise<Gudang> {
  const now = new Date().toISOString();
  const newItem: Gudang = {
    id: genId('g'),
    kodeGudang: values.kodeGudang,
    namaGudang: values.namaGudang,
    alamat: values.alamat,
    status: values.status,
    createdAt: now,
  };
  const list = storage.getGudang();
  storage.setGudang([...list, newItem]);
  return delay(newItem);
}

export async function deleteGudang(id: string): Promise<void> {
  const list = storage.getGudang();
  storage.setGudang(list.filter((g) => g.id !== id));
  return delay(undefined as void);
}

// ---- RAK ----
export async function fetchRakByGudang(gudangId: string): Promise<Rak[]> {
  const list = storage.getRak();
  return delay(list.filter((r) => r.gudangId === gudangId));
}

export async function isKodeRakDuplicate(gudangId: string, kode: string, excludeId?: string): Promise<boolean> {
  const raks = storage.getRak().filter((r) => r.gudangId === gudangId);
  return raks.some((r) => r.kodeRak.toLowerCase() === kode.trim().toLowerCase() && r.id !== excludeId);
}

export async function createRak(gudangId: string, kode: string, nama: string): Promise<Rak> {
  const now = new Date().toISOString();
  const newItem: Rak = {
    id: genId('r'),
    gudangId,
    kodeRak: kode,
    namaRak: nama || kode,
    createdAt: now,
  };
  const list = storage.getRak();
  storage.setRak([...list, newItem]);
  return delay(newItem);
}

export async function deleteRak(id: string): Promise<void> {
  const list = storage.getRak();
  storage.setRak(list.filter((r) => r.id !== id));
  return delay(undefined as void);
}

// ---- LOKASI ----
export async function fetchLokasiByRak(rakId: string): Promise<LokasiPenyimpanan[]> {
  const list = storage.getLokasi();
  return delay(list.filter((l) => l.rakId === rakId));
}

export async function isKodeLokasiDuplicate(rakId: string, kode: string, excludeId?: string): Promise<boolean> {
  const lokasis = storage.getLokasi().filter((l) => l.rakId === rakId);
  return lokasis.some((l) => l.kodeLokasi.toLowerCase() === kode.trim().toLowerCase() && l.id !== excludeId);
}

export async function createLokasi(rakId: string, kode: string, nama: string): Promise<LokasiPenyimpanan> {
  const now = new Date().toISOString();
  const newItem: LokasiPenyimpanan = {
    id: genId('l'),
    rakId,
    kodeLokasi: kode,
    namaLokasi: nama || kode,
    createdAt: now,
  };
  const list = storage.getLokasi();
  storage.setLokasi([...list, newItem]);
  return delay(newItem);
}

export async function deleteLokasi(id: string): Promise<void> {
  const list = storage.getLokasi();
  storage.setLokasi(list.filter((l) => l.id !== id));
  return delay(undefined as void);
}

// ---- FLAT LOCATIONS ----
export async function fetchAllFlatLocations(): Promise<{ id: string; fullPath: string; kodeLokasi: string }[]> {
  const gudangs = storage.getGudang();
  const raks = storage.getRak();
  const lokasis = storage.getLokasi();

  const result = lokasis.map((l) => {
    const rak = raks.find((r) => r.id === l.rakId);
    const gudang = rak ? gudangs.find((g) => g.id === rak.gudangId) : undefined;
    const fullPath = [gudang?.namaGudang, rak?.namaRak, l.namaLokasi].filter(Boolean).join(' / ');
    return { id: l.id, fullPath, kodeLokasi: l.kodeLokasi };
  });

  return delay(result);
}
