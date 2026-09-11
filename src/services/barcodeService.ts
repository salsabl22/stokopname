import type { BarcodeItem } from '../types/barcode';
import { storage, delay } from './storage';

function genId(): string {
  return `bc${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

export async function fetchBarcode(): Promise<BarcodeItem[]> {
  const db = storage.getBarcode();
  return delay([...db].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
}

export async function isBarcodeDuplicate(kode: string): Promise<boolean> {
  const db = storage.getBarcode();
  return delay(db.some((item) => item.kodeBarcode === kode.trim()));
}

export function generateBarcodeCode(): string {
  let code = '';
  for (let i = 0; i < 13; i += 1) {
    code += Math.floor(Math.random() * 10).toString();
  }
  return code;
}

export async function createBarcode(
  kodeBarcode: string,
  produkId: string,
  produkKode: string,
  produkNama: string,
): Promise<BarcodeItem> {
  const newItem: BarcodeItem = {
    id: genId(),
    kodeBarcode: kodeBarcode.trim(),
    produkId,
    produkKode,
    produkNama,
    createdAt: new Date().toISOString(),
  };
  const db = storage.getBarcode();
  storage.setBarcode([...db, newItem]);
  return delay(newItem);
}

export async function deleteBarcode(id: string): Promise<void> {
  const db = storage.getBarcode().filter((item) => item.id !== id);
  storage.setBarcode(db);
  return delay(undefined);
}
