import type { NavGroup } from '../types/nav';

export interface Breadcrumb {
  group?: string;
  label: string;
}

/**
 * Menentukan breadcrumb ("Data Master / Satuan Barang") berdasarkan path aktif,
 * dicocokkan dengan konfigurasi menu sidebar agar selalu konsisten.
 */
export function resolveBreadcrumb(pathname: string, groups: NavGroup[]): Breadcrumb {
  for (const group of groups) {
    for (const item of group.items) {
      if (item.path === pathname) {
        return { group: group.title, label: item.label };
      }
    }
  }
  return { label: 'Halaman' };
}
