import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  /** Halaman sudah diimplementasikan secara fungsional (bukan placeholder) */
  implemented?: boolean;
  /**
   * Kunci modul untuk pengecekan hak akses (harus sama dengan `modul` di
   * backend/prisma/seed.ts). Item tanpa `modul` selalu ditampilkan (mis. Dasbor).
   */
  modul?: string;
}

export interface NavGroup {
  title?: string;
  items: NavItem[];
}
