import { Routes, Route } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import MainLayout from '../components/layout/MainLayout';
import DashboardPage from '../pages/DashboardPage';
import ComingSoonPage from '../pages/ComingSoonPage';
import TugasSayaPage from '../pages/tugas-saya/TugasSayaPage';
import SatuanBarangPage from '../pages/data-master/satuan-barang/SatuanBarangPage';
import ProdukPage from '../pages/data-master/produk/ProdukPage';
import PemasokPage from '../pages/data-master/pemasok/PemasokPage';
import CabangPage from '../pages/data-master/cabang/CabangPage';
import GudangLokasiPage from '../pages/data-master/gudang/GudangLokasiPage';

import PesananPembelianPage from '../pages/barang-masuk/pesanan-pembelian/PesananPembelianPage';
import PenerimaanPage from '../pages/barang-masuk/penerimaan/PenerimaanPage';
import PemeriksaanKualitasPage from '../pages/barang-masuk/pemeriksaan-kualitas/PemeriksaanKualitasPage';
import PenyimpananPage from '../pages/barang-masuk/penyimpanan/PenyimpananPage';
import PersediaanPage from '../pages/operasional/persediaan/PersediaanPage';
import PengisianUlangPage from '../pages/operasional/pengisian-ulang/PengisianUlangPage';
import PergerakanStokPage from '../pages/operasional/pergerakan-stok/PergerakanStokPage';
import PackingPage from '../pages/operasional/packing/PackingPage';
import PesananCabangPage from '../pages/barang-keluar/pesanan-cabang/PesananCabangPage';
import AlokasiPage from '../pages/barang-keluar/alokasi/AlokasiPage';
import PengambilanPage from '../pages/barang-keluar/pengambilan/PengambilanPage';
import PengirimanPage from '../pages/barang-keluar/pengiriman/PengirimanPage';
import ReturPage from '../pages/barang-keluar/retur/ReturPage';
import PerhitunganStokPage from '../pages/pengendalian/perhitungan-stok/PerhitunganStokPage';
import PengembalianPemasokPage from '../pages/pengendalian/pengembalian-pemasok/PengembalianPemasokPage';
import WastePage from '../pages/pengendalian/waste/WastePage';
import LaporanPage from '../pages/laporan/LaporanPage';
import AdministrasiPage from '../pages/administrasi/AdministrasiPage';
import PenjualanCabangPage from '../pages/fotosnaps/penjualan-cabang/PenjualanCabangPage';
import StokCabangPage from '../pages/fotosnaps/stok-cabang/StokCabangPage';
import RequireModule from './RequireModule';

export default function AppRoutes() {
  const { user, isLoading } = useAuth();

  // Tampilkan loading spinner saat cek sesi
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-600/30 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  // Halaman publik — bisa diakses tanpa login
  if (!user) {
    return (
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<LoginPage />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/tugas-saya" element={<TugasSayaPage />} />

        {/* Data Master */}
        <Route path="/data-master/produk" element={<ProdukPage />} />
        <Route path="/data-master/satuan-barang" element={<SatuanBarangPage />} />
        <Route path="/data-master/pemasok" element={<PemasokPage />} />
        <Route path="/data-master/cabang" element={<CabangPage />} />
        <Route path="/data-master/gudang-lokasi" element={<GudangLokasiPage />} />


        {/* Barang Masuk */}
        <Route path="/barang-masuk/pesanan-pembelian" element={<PesananPembelianPage />} />
        <Route path="/barang-masuk/penerimaan" element={<PenerimaanPage />} />
        <Route path="/barang-masuk/pemeriksaan-kualitas" element={<PemeriksaanKualitasPage />} />
        <Route path="/barang-masuk/penyimpanan" element={<PenyimpananPage />} />

        {/* Operasional */}
        <Route path="/operasional/persediaan" element={<PersediaanPage />} />
        <Route path="/operasional/pengisian-ulang" element={<PengisianUlangPage />} />
        <Route path="/operasional/pergerakan-stok" element={<PergerakanStokPage />} />
        <Route path="/operasional/packing" element={<PackingPage />} />

        {/* Barang Keluar */}
        <Route path="/barang-keluar/pesanan-cabang" element={<PesananCabangPage />} />
        <Route path="/barang-keluar/alokasi" element={<AlokasiPage />} />
        <Route path="/barang-keluar/pengambilan" element={<PengambilanPage />} />
        <Route path="/barang-keluar/pengiriman" element={<PengirimanPage />} />
        <Route path="/barang-keluar/retur" element={<ReturPage />} />

        {/* Pengendalian (Stock Opname) */}
        <Route path="/pengendalian/perhitungan-stok" element={<PerhitunganStokPage />} />
        <Route path="/pengendalian/pengembalian-pemasok" element={<PengembalianPemasokPage />} />
        {/* backward compat */}
        <Route path="/pengendalian/pengecualian" element={<PengembalianPemasokPage />} />
        <Route path="/pengendalian/waste" element={<WastePage />} />

        {/* Laporan & Analitik */}
        <Route path="/laporan" element={<LaporanPage />} />

        {/* Fotosnaps — Fitur Khusus */}
        <Route path="/fotosnaps/penjualan-cabang" element={<PenjualanCabangPage />} />
        <Route path="/fotosnaps/stok-cabang" element={<StokCabangPage />} />

        {/* Administrasi — khusus role dengan hak akses modul 'pengaturan_sistem' */}
        <Route
          path="/administrasi"
          element={
            <RequireModule modul="pengaturan_sistem">
              <AdministrasiPage />
            </RequireModule>
          }
        />

        {/* Redirect /register ke dashboard jika sudah login */}
        <Route path="/register" element={<DashboardPage />} />

        <Route path="*" element={<ComingSoonPage />} />
      </Route>
    </Routes>
  );
}
