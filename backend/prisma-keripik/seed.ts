import prisma from '../src/db-keripik';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Seeding database KERIPIK BUJANGAN...');

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
    create: { name: 'ADMIN', description: 'Administrator Keripik Bujangan', permissions: { create: generatePermissions(modules, { lihat: true, buat: true, ubah: true, hapus: true, proses: true, setujui: true, export: true }) } },
  });
  const userRole = await prisma.role.upsert({
    where: { name: 'USER' }, update: {},
    create: { name: 'USER', description: 'Pengguna Gudang Keripik Bujangan', permissions: { create: generatePermissions(['dashboard', 'tugas_saya', 'barang_masuk', 'operasional', 'barang_keluar', 'stock_opname', 'retur'], { lihat: true, buat: true, ubah: true, hapus: false, proses: true, setujui: false, export: false }) } },
  });

  // 2. USERS
  const hashPassword = (p: string) => bcrypt.hashSync(p, 10);
  await prisma.user.upsert({ where: { username: 'superadmin' }, update: { roleId: superAdminRole.id, password: hashPassword('admin') }, create: { username: 'superadmin', name: 'Super Admin', password: hashPassword('admin'), roleId: superAdminRole.id } });
  await prisma.user.upsert({ where: { username: 'admin' }, update: { roleId: adminRole.id, password: hashPassword('admin') }, create: { username: 'admin', name: 'Admin Keripik Bujangan', password: hashPassword('admin'), roleId: adminRole.id } });
  await prisma.user.upsert({ where: { username: 'user' }, update: { roleId: userRole.id, password: hashPassword('user123') }, create: { username: 'user', name: 'User Keripik Bujangan', password: hashPassword('user123'), roleId: userRole.id } });

  // Bersihkan role & akun lama (SUPERVISOR/STAFF) yang tidak lagi dipakai
  await prisma.user.deleteMany({ where: { username: { in: ['supervisor', 'staff_keripik'] } } });
  await prisma.role.deleteMany({ where: { name: { in: ['SUPERVISOR', 'STAFF'] } } });

  // 3. SATUAN BARANG
  const satuanList = [
    { kode: 'PCS', nama: 'Pieces (Pcs)', deskripsi: 'Satuan dasar / satuan terkecil' },
    { kode: 'BOX', nama: 'Box', deskripsi: 'Kemasan kotak' },
    { kode: 'BAL', nama: 'Bal', deskripsi: 'Satuan bal (kemasan besar)' },
    { kode: 'PACK', nama: 'Pack', deskripsi: 'Satuan pack / bungkus' },
    { kode: 'ROLL', nama: 'Roll / Gulungan', deskripsi: 'Satuan gulungan' },
    { kode: 'LEMBAR', nama: 'Lembar', deskripsi: 'Satuan lembar' },
    { kode: 'DUS', nama: 'Dus / Karton', deskripsi: 'Satuan dus atau karton' },
    { kode: 'KG', nama: 'Kilogram (Kg)', deskripsi: 'Satuan berat kilogram' },
    { kode: 'SET', nama: 'Set', deskripsi: 'Satuan set' },
    { kode: 'METER', nama: 'Meter', deskripsi: 'Satuan panjang meter' },
    { kode: 'GR', nama: 'Gram', deskripsi: 'Satuan berat gram' },
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

  // 5. PEMASOK (khusus Keripik Bujangan)
  await prisma.pemasok.upsert({ where: { kode: 'PMS-KRPK-01' }, update: {}, create: { kode: 'PMS-KRPK-01', nama: 'CV Cemilan Nusantara', kontak: 'Pak Agus', telepon: '083456789012', email: 'cemilan@nusantara.com', alamat: 'Bandung' } });
  await prisma.pemasok.upsert({ where: { kode: 'PMS-KRPK-02' }, update: {}, create: { kode: 'PMS-KRPK-02', nama: 'Pabrik Snack Sejahtera', kontak: 'Ibu Rina', telepon: '084567890123', email: 'snack@sejahtera.co.id', alamat: 'Garut, Jawa Barat' } });

  // 6. GUDANG
  await prisma.gudang.upsert({ where: { kode: 'GDG-PUSAT' }, update: { nama: 'Gudang Pusat', alamat: 'Jl. Soekarno Hatta No. 100, Bandung' }, create: { kode: 'GDG-PUSAT', nama: 'Gudang Pusat', alamat: 'Jl. Soekarno Hatta No. 100, Bandung' } });

  // 7. PRODUK KERIPIK BUJANGAN — 7 lini produk resmi: Basreng, Keripik Singkong,
  // Cimol, Batagor, Chocoball, Pilus Arab, Makaroni (varian rasa tetap ada).
  const produkKeripik = [
    // Basreng
    { kodeProduk: 'KRPK-001', namaProduk: 'Basreng Original', kategori: 'Basreng', satuanId: satuan.PACK!.id, satuanPembelianId: satuan.DUS!.id, konversi: 24, minimumStok: 100, deskripsi: 'Basreng (Bakso Goreng) rasa original, renyah gurih' },
    { kodeProduk: 'KRPK-002', namaProduk: 'Basreng Pedas', kategori: 'Basreng', satuanId: satuan.PACK!.id, satuanPembelianId: satuan.DUS!.id, konversi: 24, minimumStok: 100, deskripsi: 'Basreng dengan bumbu pedas level 1-5' },
    { kodeProduk: 'KRPK-003', namaProduk: 'Basreng Keju', kategori: 'Basreng', satuanId: satuan.PACK!.id, satuanPembelianId: satuan.DUS!.id, konversi: 24, minimumStok: 80, deskripsi: 'Basreng dengan taburan keju cheddar' },
    { kodeProduk: 'KRPK-004', namaProduk: 'Basreng Balado', kategori: 'Basreng', satuanId: satuan.PACK!.id, satuanPembelianId: satuan.DUS!.id, konversi: 24, minimumStok: 80, deskripsi: 'Basreng bumbu balado pedas manis' },
    { kodeProduk: 'KRPK-BLK-001', namaProduk: 'Basreng Original Curah 1Kg', kategori: 'Basreng', satuanId: satuan.KG!.id, satuanPembelianId: satuan.DUS!.id, konversi: 5, minimumStok: 30, deskripsi: 'Basreng original kemasan curah 1 kg' },
    // Keripik Singkong
    { kodeProduk: 'KRPK-005', namaProduk: 'Keripik Singkong Original', kategori: 'Keripik Singkong', satuanId: satuan.PACK!.id, satuanPembelianId: satuan.DUS!.id, konversi: 24, minimumStok: 80, deskripsi: 'Keripik singkong tipis renyah rasa original' },
    { kodeProduk: 'KRPK-006', namaProduk: 'Keripik Singkong Balado', kategori: 'Keripik Singkong', satuanId: satuan.PACK!.id, satuanPembelianId: satuan.DUS!.id, konversi: 24, minimumStok: 80, deskripsi: 'Keripik singkong bumbu balado pedas' },
    { kodeProduk: 'KRPK-BLK-002', namaProduk: 'Keripik Singkong Curah 1Kg', kategori: 'Keripik Singkong', satuanId: satuan.KG!.id, satuanPembelianId: satuan.DUS!.id, konversi: 5, minimumStok: 30, deskripsi: 'Keripik singkong original kemasan curah 1 kg' },
    // Cimol
    { kodeProduk: 'KRPK-009', namaProduk: 'Cimol Original', kategori: 'Cimol', satuanId: satuan.PACK!.id, satuanPembelianId: satuan.DUS!.id, konversi: 20, minimumStok: 60, deskripsi: 'Cimol aci gurih rasa original' },
    { kodeProduk: 'KRPK-010', namaProduk: 'Cimol Pedas', kategori: 'Cimol', satuanId: satuan.PACK!.id, satuanPembelianId: satuan.DUS!.id, konversi: 20, minimumStok: 60, deskripsi: 'Cimol bumbu pedas extra' },
    // Batagor
    { kodeProduk: 'KRPK-011', namaProduk: 'Batagor', kategori: 'Batagor', satuanId: satuan.PACK!.id, satuanPembelianId: satuan.DUS!.id, konversi: 20, minimumStok: 50, deskripsi: 'Batagor (Bakso Tahu Goreng) renyah dengan saus kacang' },
    // Makaroni
    { kodeProduk: 'KRPK-013', namaProduk: 'Makaroni Pedas', kategori: 'Makaroni', satuanId: satuan.PACK!.id, satuanPembelianId: satuan.DUS!.id, konversi: 24, minimumStok: 80, deskripsi: 'Makaroni goreng renyah bumbu pedas' },
    { kodeProduk: 'KRPK-014', namaProduk: 'Makaroni Keju', kategori: 'Makaroni', satuanId: satuan.PACK!.id, satuanPembelianId: satuan.DUS!.id, konversi: 24, minimumStok: 60, deskripsi: 'Makaroni goreng renyah rasa keju' },
    // Chocoball
    { kodeProduk: 'KRPK-015', namaProduk: 'Chocoball', kategori: 'Chocoball', satuanId: satuan.PACK!.id, satuanPembelianId: satuan.DUS!.id, konversi: 24, minimumStok: 60, deskripsi: 'Bola coklat renyah dengan filling coklat cair' },
    // Pilus Arab
    { kodeProduk: 'KRPK-016', namaProduk: 'Pilus Arab', kategori: 'Pilus Arab', satuanId: satuan.PACK!.id, satuanPembelianId: satuan.DUS!.id, konversi: 24, minimumStok: 60, deskripsi: 'Pilus arab renyah dengan bumbu khas timur tengah' },
  ];

  // Produk lama yang tidak lagi masuk 7 lini resmi — hapus dari katalog.
  const kodeProdukDihapus = ['KRPK-007', 'KRPK-008', 'KRPK-012', 'KRPK-017', 'KRPK-018', 'KRPK-019', 'KRPK-020'];
  await prisma.produk.deleteMany({ where: { kodeProduk: { in: kodeProdukDihapus } } });


  for (const p of produkKeripik) {
    await prisma.produk.upsert({
      where: { kodeProduk: p.kodeProduk },
      update: { ...p, unitBisnis: 'KERIPIK_BUJANGAN' },
      create: { ...p, unitBisnis: 'KERIPIK_BUJANGAN', status: 'aktif' },
    });
    console.log(`  + Keripik: ${p.namaProduk}`);
  }

  console.log('Seeding KERIPIK BUJANGAN selesai:', produkKeripik.length, 'produk');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
