import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';

export type UnitBisnis = 'FOTOSNAPS' | 'BURGER_CHILL' | 'KERIPIK_BUJANGAN';

export interface UnitBisnisInfo {
  id: UnitBisnis;
  label: string;
  shortLabel: string;
  color: string;
  bgColor: string;
  logoUrl: string;
}

export const UNIT_BISNIS_LIST: UnitBisnisInfo[] = [
  {
    id: 'FOTOSNAPS',
    label: 'Fotosnaps',
    shortLabel: 'FOTO',
    color: 'text-brand-400',
    bgColor: 'bg-brand-600/20 border-brand-500/30',
    logoUrl: '/logos/fotosnaps.jpg',
  },
  {
    id: 'BURGER_CHILL',
    label: 'Burger Chill',
    shortLabel: 'BRGR',
    color: 'text-brand-400',
    bgColor: 'bg-brand-600/20 border-brand-500/30',
    logoUrl: '/logos/burgerchill.jpg',
  },
  {
    id: 'KERIPIK_BUJANGAN',
    label: 'Keripik Bujangan',
    shortLabel: 'KRPK',
    color: 'text-brand-400',
    bgColor: 'bg-brand-600/20 border-brand-500/30',
    logoUrl: '/logos/keripik.jpg',
  },
];

interface BusinessUnitContextType {
  activeUnit: UnitBisnis;
  activeUnitInfo: UnitBisnisInfo;
  setActiveUnit: (unit: UnitBisnis) => void;
}

const BusinessUnitContext = createContext<BusinessUnitContextType | undefined>(undefined);

export function BusinessUnitProvider({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const [activeUnit, setActiveUnitState] = useState<UnitBisnis>(() => {
    const stored = localStorage.getItem('wms_unit_bisnis');
    return (stored === 'FOTOSNAPS' || stored === 'BURGER_CHILL' || stored === 'KERIPIK_BUJANGAN') ? stored : 'FOTOSNAPS';
  });

  const setActiveUnit = (unit: UnitBisnis) => {
    // Sesi login terikat ke satu unit bisnis (token di-scope per unit di backend).
    // Ganti unit sambil masih login akan membuat semua request gagal diam-diam,
    // jadi paksa logout dulu supaya user login ulang untuk unit yang baru.
    if (unit !== activeUnit && user) {
      logout();
    }
    setActiveUnitState(unit);
    localStorage.setItem('wms_unit_bisnis', unit);
  };

  const activeUnitInfo = UNIT_BISNIS_LIST.find(u => u.id === activeUnit)!;

  return (
    <BusinessUnitContext.Provider value={{ activeUnit, activeUnitInfo, setActiveUnit }}>
      {children}
    </BusinessUnitContext.Provider>
  );
}

export function useBusinessUnit() {
  const context = useContext(BusinessUnitContext);
  if (context === undefined) {
    throw new Error('useBusinessUnit must be used within a BusinessUnitProvider');
  }
  return context;
}
