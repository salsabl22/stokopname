import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  Package,
  Ruler,
  Truck,
  CalendarDays,
  GitBranch,
  Warehouse,
  ShoppingCart,
  PackageCheck,
  ClipboardCheck,
  Archive,
  Boxes,
  RefreshCw,
  BarChart3,
  PackagePlus,
  MoveRight,
  Send,
  Undo2,
  Scale,
  RotateCcw,
  Trash2,
  Users,
  Menu,
  X,
  ChevronDown,
  ShoppingBag,
  LineChart,
} from 'lucide-react';
import type { NavItem, NavGroup } from '../../types/nav';
import { useAuth } from '../../contexts/AuthContext';
import { useBusinessUnit, UNIT_BISNIS_LIST } from '../../contexts/BusinessUnitContext';
import type { UnitBisnis } from '../../contexts/BusinessUnitContext';
import { canView } from '../../utils/permissions';

/** Unit bisnis yang menggunakan istilah "Event" sebagai pengganti "Cabang" */
const UNIT_PAKAI_EVENT: UnitBisnis[] = ['BURGER_CHILL', 'KERIPIK_BUJANGAN'];

function isUnitPakaiEvent(unit: UnitBisnis): boolean {
  return UNIT_PAKAI_EVENT.includes(unit);
}

/** Bangun daftar nav group berdasarkan unit bisnis aktif. */
export function buildNavGroups(activeUnit: UnitBisnis): NavGroup[] {
  const labelCabangAtauEvent = isUnitPakaiEvent(activeUnit) ? 'Event' : 'Cabang';
  const labelPesananCabangAtauEvent = isUnitPakaiEvent(activeUnit) ? 'Pesanan Event' : 'Pesanan Cabang';
  const iconCabangAtauEvent = isUnitPakaiEvent(activeUnit) ? CalendarDays : GitBranch;

  return [
    {
      items: [
        { label: 'Dasbor', path: '/', icon: LayoutDashboard, implemented: true },
        { label: 'Tugas Saya', path: '/tugas-saya', icon: ClipboardList, implemented: true },
      ],
    },
    {
      title: 'Data Master',
      items: [
        { label: 'Produk', path: '/data-master/produk', modul: 'data_master', icon: Package, implemented: true },
        { label: 'Satuan Barang', path: '/data-master/satuan-barang', modul: 'data_master', icon: Ruler, implemented: true },
        { label: 'Supplier', path: '/data-master/pemasok', modul: 'data_master', icon: Truck, implemented: true },
        { label: labelCabangAtauEvent, path: '/data-master/cabang', modul: 'data_master', icon: iconCabangAtauEvent, implemented: true },
        { label: 'Gudang & Lokasi', path: '/data-master/gudang-lokasi', modul: 'data_master', icon: Warehouse, implemented: true },
      ],
    },
    {
      title: 'Barang Masuk',
      items: [
        { label: 'Pesanan Pembelian', path: '/barang-masuk/pesanan-pembelian', modul: 'barang_masuk', icon: ShoppingCart, implemented: true },
        { label: 'Penerimaan', path: '/barang-masuk/penerimaan', modul: 'barang_masuk', icon: PackageCheck, implemented: true },
        { label: 'Pemeriksaan Kualitas', path: '/barang-masuk/pemeriksaan-kualitas', modul: 'barang_masuk', icon: ClipboardCheck, implemented: true },
        { label: 'Penyimpanan', path: '/barang-masuk/penyimpanan', modul: 'barang_masuk', icon: Archive, implemented: true },
      ],
    },
    {
      title: 'Operasional',
      items: [
        { label: 'Persediaan', path: '/operasional/persediaan', modul: 'operasional', icon: Boxes, implemented: true },
        { label: 'Pengisian Ulang', path: '/operasional/pengisian-ulang', modul: 'operasional', icon: RefreshCw, implemented: true },
        { label: 'Pergerakan Stok', path: '/operasional/pergerakan-stok', modul: 'operasional', icon: BarChart3, implemented: true },
      ],
    },
    {
      title: 'Barang Keluar',
      items: [
        { label: labelPesananCabangAtauEvent, path: '/barang-keluar/pesanan-cabang', modul: 'barang_keluar', icon: ShoppingCart, implemented: true },
        { label: 'Alokasi', path: '/barang-keluar/alokasi', modul: 'barang_keluar', icon: MoveRight, implemented: true },
        { label: 'Pengambilan', path: '/barang-keluar/pengambilan', modul: 'barang_keluar', icon: PackageCheck, implemented: true },
        { label: 'Packing', path: '/operasional/packing', modul: 'barang_keluar', icon: PackagePlus, implemented: true },
        { label: 'Pengiriman', path: '/barang-keluar/pengiriman', modul: 'barang_keluar', icon: Send, implemented: true },
        { label: 'Retur', path: '/barang-keluar/retur', modul: 'barang_keluar', icon: Undo2, implemented: true },
      ],
    },
    {
      title: 'Pengendalian',
      items: [
        { label: 'Perhitungan Stok', path: '/pengendalian/perhitungan-stok', modul: 'stock_opname', icon: Scale, implemented: true },
        { label: 'Pengembalian ke Supplier', path: '/pengendalian/pengembalian-pemasok', modul: 'stock_opname', icon: RotateCcw, implemented: true },
        { label: 'Waste', path: '/pengendalian/waste', modul: 'stock_opname', icon: Trash2, implemented: true },
      ],
    },
    {
      title: 'Laporan & Analitik',
      items: [
        { label: 'Laporan', path: '/laporan', modul: 'laporan', icon: BarChart3, implemented: true },
      ],
    },
    // Fitur eksklusif Fotosnaps — hanya tampil jika activeUnit === 'FOTOSNAPS'
    ...(activeUnit === 'FOTOSNAPS'
      ? [
        {
          title: 'Fotosnaps — Cabang',
          items: [
            { label: 'Penjualan Cabang', path: '/fotosnaps/penjualan-cabang', modul: 'barang_keluar', icon: ShoppingBag, implemented: true },
            { label: 'Stok Cabang', path: '/fotosnaps/stok-cabang', modul: 'stock_opname', icon: LineChart, implemented: true },
          ],
        },
      ]
      : []),
    {
      title: 'Sistem',
      items: [
        { label: 'Administrasi', path: '/administrasi', modul: 'pengaturan_sistem', icon: Users, implemented: true },
      ],
    },
  ];
}

export default function Sidebar() {
  const { user } = useAuth();
  const { activeUnit, activeUnitInfo, setActiveUnit } = useBusinessUnit();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unitDropdownOpen, setUnitDropdownOpen] = useState(false);

  const navGroups = buildNavGroups(activeUnit);

  const visibleGroups = navGroups.map((group) => ({
    ...group,
    items: group.items.filter((item: NavItem) => !item.modul || canView(user, item.modul)),
  })).filter((group) => group.items.length > 0);

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="flex flex-col items-center justify-center px-4 py-3 border-b border-white/10 relative">
        <div className="w-full flex items-center justify-center rounded-lg bg-white/5 border border-white/10 p-2">
          <img
            src={activeUnitInfo.logoUrl}
            alt={`${activeUnitInfo.label} Logo`}
            className="w-full max-h-16 object-contain"
          />
        </div>
        <button
          className="absolute top-2 right-2 lg:hidden text-slate-400 hover:text-white bg-navy-950/50 rounded-full p-1"
          onClick={() => setMobileOpen(false)}
        >
          <X size={16} />
        </button>
      </div>

      {/* Business Unit Switcher */}
      <div className="px-3 py-2.5 border-b border-white/10">
        <p className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase mb-1.5 px-1">Unit Bisnis</p>
        <div className="relative">
          <button
            className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg border text-xs font-medium transition-all ${activeUnitInfo.bgColor} ${activeUnitInfo.color}`}
            onClick={() => setUnitDropdownOpen(!unitDropdownOpen)}
          >
            <span className="flex-1 text-left">{activeUnitInfo.label}</span>
            <ChevronDown size={12} className={`transition-transform ${unitDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {unitDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-navy-900 border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden">
              {UNIT_BISNIS_LIST.map((unit) => (
                <button
                  key={unit.id}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs transition-colors ${activeUnit === unit.id
                      ? `${unit.bgColor} ${unit.color} font-medium`
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                  onClick={() => {
                    setActiveUnit(unit.id);
                    setUnitDropdownOpen(false);
                  }}
                >
                  <span>{unit.label}</span>
                  {activeUnit === unit.id && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-current" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-4 overflow-y-auto hide-scrollbar">
        {visibleGroups.map((group, idx) => (
          <div key={idx}>
            {group.title && (
              <p className="px-2.5 mb-1 text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
                {group.title}
              </p>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    end={item.path === '/'}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs transition-colors ${isActive
                        ? 'bg-brand-600/20 text-brand-400 font-medium border border-brand-500/30'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                      }`
                    }
                  >
                    <item.icon size={14} strokeWidth={2} className="shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>


    </div>
  );

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        className="lg:hidden fixed top-3.5 left-3.5 z-50 w-9 h-9 bg-navy-950 text-white rounded-lg flex items-center justify-center shadow-lg border border-white/10"
        onClick={() => setMobileOpen(true)}
        aria-label="Buka menu"
      >
        <Menu size={18} />
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-60 shrink-0 h-screen sticky top-0 bg-navy-950 text-slate-300 flex-col overflow-y-auto hide-scrollbar">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 w-64 bg-navy-950 text-slate-300 flex flex-col z-50 transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
