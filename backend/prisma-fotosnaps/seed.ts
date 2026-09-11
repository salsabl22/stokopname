import prisma from '../src/db-fotosnaps';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Seeding database FOTOSNAPS...');

  const modules = [
    'dashboard', 'tugas_saya', 'data_master', 'barang_masuk', 'operasional',
    'barang_keluar', 'stock_opname', 'laporan', 'pengaturan_sistem',
    'pengembalian_pemasok', 'retur', 'pengiriman',
  ];

  const generatePermissions = (allowedModules: string[], actions: Record<string, boolean>) =>
    allowedModules.map((modul) => ({
      modul,
      lihat: actions.lihat ?? false,
      buat: actions.buat ?? false,
      ubah: actions.ubah ?? false,
      hapus: actions.hapus ?? false,
      proses: actions.proses ?? false,
      setujui: actions.setujui ?? false,
      export: actions.export ?? false,
    }));

  // 1. ROLES
  const superAdminRole = await prisma.role.upsert({
    where: { name: 'SUPER ADMIN' }, update: {},
    create: {
      name: 'SUPER ADMIN', description: 'Super Administrator - Akses penuh',
      permissions: { create: [{ modul: 'semua', lihat: true, buat: true, ubah: true, hapus: true, proses: true, setujui: true, export: true }] },
    },
  });
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' }, update: {},
    create: { name: 'ADMIN', description: 'Administrator Fotosnaps', permissions: { create: generatePermissions(modules, { lihat: true, buat: true, ubah: true, hapus: true, proses: true, setujui: true, export: true }) } },
  });
  const userRole = await prisma.role.upsert({
    where: { name: 'USER' }, update: {},
    create: { name: 'USER', description: 'Pengguna Gudang Fotosnaps', permissions: { create: generatePermissions(['dashboard', 'tugas_saya', 'barang_masuk', 'operasional', 'barang_keluar', 'stock_opname', 'retur'], { lihat: true, buat: true, ubah: true, hapus: false, proses: true, setujui: false, export: false }) } },
  });

  // 2. USERS
  const hashPassword = (p: string) => bcrypt.hashSync(p, 10);
  await prisma.user.upsert({ where: { username: 'superadmin' }, update: { roleId: superAdminRole.id, password: hashPassword('admin') }, create: { username: 'superadmin', name: 'Super Admin', password: hashPassword('admin'), roleId: superAdminRole.id } });
  await prisma.user.upsert({ where: { username: 'admin' }, update: { roleId: adminRole.id, password: hashPassword('admin') }, create: { username: 'admin', name: 'Admin Fotosnaps', password: hashPassword('admin'), roleId: adminRole.id } });
  await prisma.user.upsert({ where: { username: 'user' }, update: { roleId: userRole.id, password: hashPassword('user123') }, create: { username: 'user', name: 'User Fotosnaps', password: hashPassword('user123'), roleId: userRole.id } });

  // Bersihkan role & akun lama (SUPERVISOR/STAFF) yang tidak lagi dipakai
  await prisma.user.deleteMany({ where: { username: { in: ['supervisor', 'staff_foto'] } } });
  await prisma.role.deleteMany({ where: { name: { in: ['SUPERVISOR', 'STAFF'] } } });

  // 3. SATUAN BARANG
  const satuanList = [
    { kode: 'PCS', nama: 'Pieces (Pcs)', deskripsi: 'Satuan dasar / satuan terkecil' },
    { kode: 'BOX', nama: 'Box', deskripsi: 'Kemasan kotak' },
    { kode: 'BAL', nama: 'Bal', deskripsi: 'Satuan bal (kemasan besar)' },
    { kode: 'PACK', nama: 'Pack', deskripsi: 'Satuan pack / bungkus' },
    { kode: 'ROLL', nama: 'Roll / Gulungan', deskripsi: 'Satuan gulungan (roll film, kertas roll, dll)' },
    { kode: 'LEMBAR', nama: 'Lembar', deskripsi: 'Satuan lembar (kertas, hologram, dll)' },
    { kode: 'DUS', nama: 'Dus / Karton', deskripsi: 'Satuan dus atau karton' },
    { kode: 'KG', nama: 'Kilogram (Kg)', deskripsi: 'Satuan berat kilogram' },
    { kode: 'SET', nama: 'Set', deskripsi: 'Satuan set' },
    { kode: 'METER', nama: 'Meter', deskripsi: 'Satuan panjang meter (rantai, tali, dll)' },
    { kode: 'GR', nama: 'Gram', deskripsi: 'Satuan berat gram (resin, charm, dll)' },
  ];
  const satuan: Record<string, { id: string }> = {};
  for (const s of satuanList) {
    satuan[s.kode] = await prisma.satuanBarang.upsert({ where: { kode: s.kode }, update: {}, create: s });
  }

  // 4. CABANG
  const cabangList = [
    { kode: 'CBG-PUSAT', nama: 'Cabang Pusat', tipe: 'PUSAT', telepon: '021-1234567', alamat: 'Jakarta Pusat' },
    { kode: 'CBG-01', nama: 'Cabang Bandung', tipe: 'CABANG', telepon: '022-1234567', alamat: 'Bandung, Jawa Barat' },
    { kode: 'CBG-02', nama: 'Cabang Surabaya', tipe: 'CABANG', telepon: '031-1234567', alamat: 'Surabaya, Jawa Timur' },
    { kode: 'CBG-03', nama: 'Cabang Yogyakarta', tipe: 'CABANG', telepon: '0274-1234567', alamat: 'Yogyakarta, DIY' },
  ];
  for (const c of cabangList) await prisma.cabang.upsert({ where: { kode: c.kode }, update: {}, create: c });

  // 5. PEMASOK (khusus Fotosnaps)
  await prisma.pemasok.upsert({ where: { kode: 'PMS-FOTO-01' }, update: {}, create: { kode: 'PMS-FOTO-01', nama: 'Supplier Kertas Foto Jaya', kontak: 'Pak Budi', telepon: '081234567890', email: 'kertas.foto@jaya.com', alamat: 'Jakarta Barat' } });
  await prisma.pemasok.upsert({ where: { kode: 'PMS-FOTO-02' }, update: {}, create: { kode: 'PMS-FOTO-02', nama: 'UD Aksesoris Snap', kontak: 'Ibu Sari', telepon: '082345678901', email: 'aksesori@snap.com', alamat: 'Bandung' } });

  // 6. GUDANG
  await prisma.gudang.upsert({ where: { kode: 'GDG-PUSAT' }, update: { nama: 'Gudang Pusat', alamat: 'Jl. Soekarno Hatta No. 100, Bandung' }, create: { kode: 'GDG-PUSAT', nama: 'Gudang Pusat', alamat: 'Jl. Soekarno Hatta No. 100, Bandung' } });

  // 7. PRODUK FOTOSNAPS
  const produkFotosnaps = [
    { kodeProduk: 'FOTO-001', namaProduk: 'Roll Film', kategori: 'Film & Media', satuanId: satuan.ROLL!.id, satuanPembelianId: satuan.DUS!.id, konversi: 10, minimumStok: 50, deskripsi: 'Roll film untuk kamera analog dan foto booth' },
    { kodeProduk: 'FOTO-002', namaProduk: 'Roll Jibbitz', kategori: 'Aksesoris Foto', satuanId: satuan.ROLL!.id, satuanPembelianId: satuan.DUS!.id, konversi: 12, minimumStok: 30, deskripsi: 'Roll jibbitz untuk dekorasi foto booth' },
    { kodeProduk: 'FOTO-003', namaProduk: 'Snapclik 2D', kategori: 'Produk Foto', satuanId: satuan.PCS!.id, satuanPembelianId: satuan.BOX!.id, konversi: 10, minimumStok: 100, deskripsi: 'Foto snapclik format 2D standard' },
    { kodeProduk: 'FOTO-004', namaProduk: 'Snapclik Colorfull', kategori: 'Produk Foto', satuanId: satuan.PCS!.id, satuanPembelianId: satuan.BOX!.id, konversi: 10, minimumStok: 100, deskripsi: 'Foto snapclik format colorfull/warna-warni' },
    { kodeProduk: 'FOTO-005', namaProduk: 'Snapclik Frame Foto 3D', kategori: 'Produk Foto', satuanId: satuan.PCS!.id, satuanPembelianId: satuan.BOX!.id, konversi: 6, minimumStok: 50, deskripsi: 'Foto snapclik dengan frame 3D eksklusif' },
    { kodeProduk: 'FOTO-006', namaProduk: 'Lego', kategori: 'Aksesoris Jibbitz', satuanId: satuan.PCS!.id, satuanPembelianId: satuan.PACK!.id, konversi: 20, minimumStok: 200, deskripsi: 'Badan lego untuk jibbitz foto' },
    { kodeProduk: 'FOTO-007', namaProduk: 'Kepala Lego Cowok', kategori: 'Aksesoris Jibbitz', satuanId: satuan.PCS!.id, satuanPembelianId: satuan.PACK!.id, konversi: 20, minimumStok: 150, deskripsi: 'Kepala lego karakter cowok untuk jibbitz' },
    { kodeProduk: 'FOTO-008', namaProduk: 'Kepala Lego Cewek', kategori: 'Aksesoris Jibbitz', satuanId: satuan.PCS!.id, satuanPembelianId: satuan.PACK!.id, konversi: 20, minimumStok: 150, deskripsi: 'Kepala lego karakter cewek untuk jibbitz' },
    { kodeProduk: 'FOTO-009', namaProduk: 'Rambut Lego Cowok', kategori: 'Aksesoris Jibbitz', satuanId: satuan.PCS!.id, satuanPembelianId: satuan.PACK!.id, konversi: 20, minimumStok: 150, deskripsi: 'Rambut/wig lego karakter cowok' },
    { kodeProduk: 'FOTO-010', namaProduk: 'Rambut Lego Cewek', kategori: 'Aksesoris Jibbitz', satuanId: satuan.PCS!.id, satuanPembelianId: satuan.PACK!.id, konversi: 20, minimumStok: 150, deskripsi: 'Rambut/wig lego karakter cewek' },
    { kodeProduk: 'FOTO-011', namaProduk: 'Kertas DNP QW410', kategori: 'Kertas Cetak', satuanId: satuan.PACK!.id, satuanPembelianId: satuan.DUS!.id, konversi: 6, minimumStok: 20, deskripsi: 'Kertas cetak foto DNP model QW410' },
    { kodeProduk: 'FOTO-012', namaProduk: 'Kertas HS-RX1', kategori: 'Kertas Cetak', satuanId: satuan.PACK!.id, satuanPembelianId: satuan.DUS!.id, konversi: 6, minimumStok: 20, deskripsi: 'Kertas cetak foto DNP model HS-RX1' },
    { kodeProduk: 'FOTO-013', namaProduk: 'Kertas DS620', kategori: 'Kertas Cetak', satuanId: satuan.PACK!.id, satuanPembelianId: satuan.DUS!.id, konversi: 6, minimumStok: 20, deskripsi: 'Kertas cetak foto DNP model DS620' },
    { kodeProduk: 'FOTO-014', namaProduk: 'Charm', kategori: 'Aksesoris Jibbitz', satuanId: satuan.PCS!.id, satuanPembelianId: satuan.PACK!.id, konversi: 50, minimumStok: 500, deskripsi: 'Charm / gantungan kecil untuk jibbitz' },
    { kodeProduk: 'FOTO-015', namaProduk: 'Rantai Biji', kategori: 'Aksesoris Jibbitz', satuanId: satuan.METER!.id, satuanPembelianId: satuan.ROLL!.id, konversi: 50, minimumStok: 100, deskripsi: 'Rantai biji untuk jibbitz (per meter)' },
    { kodeProduk: 'FOTO-016', namaProduk: 'Resin', kategori: 'Bahan Produksi', satuanId: satuan.GR!.id, satuanPembelianId: satuan.KG!.id, konversi: 1000, minimumStok: 2000, deskripsi: 'Bahan resin untuk pembuatan jibbitz' },
    { kodeProduk: 'FOTO-017', namaProduk: 'Kertas Hologram', kategori: 'Kertas Cetak', satuanId: satuan.LEMBAR!.id, satuanPembelianId: satuan.PACK!.id, konversi: 50, minimumStok: 200, deskripsi: 'Kertas hologram efek pelangi untuk foto premium' },
    { kodeProduk: 'FOTO-018', namaProduk: 'Kertas Epson Transparan', kategori: 'Kertas Cetak', satuanId: satuan.LEMBAR!.id, satuanPembelianId: satuan.PACK!.id, konversi: 50, minimumStok: 100, deskripsi: 'Kertas Epson jenis transparan untuk cetak stiker' },
    { kodeProduk: 'FOTO-019', namaProduk: 'Kertas Epson Regular', kategori: 'Kertas Cetak', satuanId: satuan.LEMBAR!.id, satuanPembelianId: satuan.PACK!.id, konversi: 100, minimumStok: 200, deskripsi: 'Kertas Epson jenis regular untuk cetak foto biasa' },
    { kodeProduk: 'FOTO-020', namaProduk: 'Kertas Koran', kategori: 'Kertas Cetak', satuanId: satuan.LEMBAR!.id, satuanPembelianId: satuan.DUS!.id, konversi: 500, minimumStok: 1000, deskripsi: 'Kertas koran untuk pembungkus/dekorasi foto' },
  ];

  for (const p of produkFotosnaps) {
    await prisma.produk.upsert({
      where: { kodeProduk: p.kodeProduk },
      update: { ...p, unitBisnis: 'FOTOSNAPS' },
      create: { ...p, unitBisnis: 'FOTOSNAPS', status: 'aktif' },
    });
    console.log(`  + Fotosnaps: ${p.namaProduk}`);
  }

  console.log('Seeding FOTOSNAPS selesai:', produkFotosnaps.length, 'produk');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
