import prisma from '../src/db';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Start seeding...');

  // --- Konstanta Modul ---
  const modules = [
    'dashboard',
    'tugas_saya',
    'data_master',
    'barang_masuk',
    'operasional',
    'barang_keluar',
    'stock_opname',
    'laporan',
    'pengaturan_sistem',
    'pengembalian_pemasok',
    'retur',
    'pengiriman',
  ];

  const generatePermissions = (
    allowedModules: string[],
    actions: {
      lihat?: boolean;
      buat?: boolean;
      ubah?: boolean;
      hapus?: boolean;
      proses?: boolean;
      setujui?: boolean;
      export?: boolean;
    },
  ) => {
    return allowedModules.map((modul) => ({
      modul,
      lihat: actions.lihat ?? false,
      buat: actions.buat ?? false,
      ubah: actions.ubah ?? false,
      hapus: actions.hapus ?? false,
      proses: actions.proses ?? false,
      setujui: actions.setujui ?? false,
      export: actions.export ?? false,
    }));
  };

  // ============================================================
  // 1. ROLES
  // ============================================================
  const superAdminRole = await prisma.role.upsert({
    where: { name: 'SUPER ADMIN' },
    update: {},
    create: {
      name: 'SUPER ADMIN',
      description: 'Super Administrator - Akses penuh ke semua modul',
      permissions: {
        create: [
          {
            modul: 'semua',
            lihat: true,
            buat: true,
            ubah: true,
            hapus: true,
            proses: true,
            setujui: true,
            export: true,
          },
        ],
      },
    },
  });

  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      description: 'Administrator Operasional',
      permissions: {
        create: generatePermissions(modules, {
          lihat: true,
          buat: true,
          ubah: true,
          hapus: true,
          proses: true,
          setujui: true,
          export: true,
        }),
      },
    },
  });

  const supervisorRole = await prisma.role.upsert({
    where: { name: 'SUPERVISOR' },
    update: {},
    create: {
      name: 'SUPERVISOR',
      description: 'Supervisor Gudang',
      permissions: {
        create: generatePermissions(modules, {
          lihat: true,
          buat: true,
          ubah: true,
          hapus: false,
          proses: true,
          setujui: true,
          export: true,
        }),
      },
    },
  });

  const staffRole = await prisma.role.upsert({
    where: { name: 'STAFF' },
    update: {},
    create: {
      name: 'STAFF',
      description: 'Staf Gudang / Operator',
      permissions: {
        create: generatePermissions(
          ['dashboard', 'tugas_saya', 'barang_masuk', 'operasional', 'barang_keluar', 'stock_opname', 'retur'],
          { lihat: true, buat: true, ubah: true, hapus: false, proses: true, setujui: false, export: false },
        ),
      },
    },
  });

  console.log('Roles seeded:', superAdminRole.name, adminRole.name, supervisorRole.name, staffRole.name);

  // ============================================================
  // 2. USERS
  // ============================================================
  const hashPassword = (password: string) => bcrypt.hashSync(password, 10);

  await prisma.user.upsert({
    where: { username: 'superadmin' },
    update: { roleId: superAdminRole.id, password: hashPassword('admin') },
    create: {
      username: 'superadmin',
      name: 'Super Admin',
      password: hashPassword('admin'),
      roleId: superAdminRole.id,
    },
  });

  await prisma.user.upsert({
    where: { username: 'admin' },
    update: { roleId: adminRole.id, password: hashPassword('admin') },
    create: {
      username: 'admin',
      name: 'Admin WMS',
      password: hashPassword('admin'),
      roleId: adminRole.id,
    },
  });

  await prisma.user.upsert({
    where: { username: 'supervisor' },
    update: { roleId: supervisorRole.id, password: hashPassword('supervisor') },
    create: {
      username: 'supervisor',
      name: 'Spv Gudang',
      password: hashPassword('supervisor'),
      roleId: supervisorRole.id,
    },
  });

  await prisma.user.upsert({
    where: { username: 'user' },
    update: { roleId: staffRole.id, password: hashPassword('user') },
    create: {
      username: 'user',
      name: 'Staf Lapangan',
      password: hashPassword('user'),
      roleId: staffRole.id,
    },
  });

  // User khusus Fotosnaps
  await prisma.user.upsert({
    where: { username: 'staff_foto' },
    update: { roleId: staffRole.id, password: hashPassword('staff123') },
    create: {
      username: 'staff_foto',
      name: 'Staff Fotosnaps',
      password: hashPassword('staff123'),
      roleId: staffRole.id,
    },
  });

  // User khusus Keripik Bujangan
  await prisma.user.upsert({
    where: { username: 'staff_keripik' },
    update: { roleId: staffRole.id, password: hashPassword('staff123') },
    create: {
      username: 'staff_keripik',
      name: 'Staff Keripik Bujangan',
      password: hashPassword('staff123'),
      roleId: staffRole.id,
    },
  });

  console.log('Users seeded.');

  // ============================================================
  // 3. SATUAN BARANG (MASTER UNIT)
  // ============================================================
  const pcs = await prisma.satuanBarang.upsert({
    where: { kode: 'PCS' },
    update: {},
    create: { kode: 'PCS', nama: 'Pieces (Pcs)', deskripsi: 'Satuan dasar / satuan terkecil' },
  });
  const box = await prisma.satuanBarang.upsert({
    where: { kode: 'BOX' },
    update: {},
    create: { kode: 'BOX', nama: 'Box', deskripsi: 'Kemasan kotak' },
  });
  const bal = await prisma.satuanBarang.upsert({
    where: { kode: 'BAL' },
    update: {},
    create: { kode: 'BAL', nama: 'Bal', deskripsi: 'Satuan bal (kemasan besar)' },
  });
  const pack = await prisma.satuanBarang.upsert({
    where: { kode: 'PACK' },
    update: {},
    create: { kode: 'PACK', nama: 'Pack', deskripsi: 'Satuan pack / bungkus' },
  });
  const roll = await prisma.satuanBarang.upsert({
    where: { kode: 'ROLL' },
    update: {},
    create: { kode: 'ROLL', nama: 'Roll / Gulungan', deskripsi: 'Satuan gulungan (roll film, kertas roll, dll)' },
  });
  const lembar = await prisma.satuanBarang.upsert({
    where: { kode: 'LEMBAR' },
    update: {},
    create: { kode: 'LEMBAR', nama: 'Lembar', deskripsi: 'Satuan lembar (kertas, hologram, dll)' },
  });
  const dus = await prisma.satuanBarang.upsert({
    where: { kode: 'DUS' },
    update: {},
    create: { kode: 'DUS', nama: 'Dus / Karton', deskripsi: 'Satuan dus atau karton' },
  });
  const kg = await prisma.satuanBarang.upsert({
    where: { kode: 'KG' },
    update: {},
    create: { kode: 'KG', nama: 'Kilogram (Kg)', deskripsi: 'Satuan berat kilogram' },
  });
  const set = await prisma.satuanBarang.upsert({
    where: { kode: 'SET' },
    update: {},
    create: { kode: 'SET', nama: 'Set', deskripsi: 'Satuan set (beberapa item dalam satu set)' },
  });
  const meter = await prisma.satuanBarang.upsert({
    where: { kode: 'METER' },
    update: {},
    create: { kode: 'METER', nama: 'Meter', deskripsi: 'Satuan panjang meter (rantai, tali, dll)' },
  });
  const gram = await prisma.satuanBarang.upsert({
    where: { kode: 'GR' },
    update: {},
    create: { kode: 'GR', nama: 'Gram', deskripsi: 'Satuan berat gram (resin, charm, dll)' },
  });

  console.log('Satuan barang seeded:', pcs.kode, box.kode, bal.kode, pack.kode, roll.kode, lembar.kode, dus.kode, kg.kode, set.kode, meter.kode, gram.kode);

  // ============================================================
  // 4. CABANG
  // ============================================================
  await prisma.cabang.upsert({
    where: { kode: 'CBG-PUSAT' },
    update: {},
    create: { kode: 'CBG-PUSAT', nama: 'Cabang Pusat', tipe: 'PUSAT', telepon: '021-1234567', alamat: 'Jakarta Pusat' },
  });
  await prisma.cabang.upsert({
    where: { kode: 'CBG-01' },
    update: {},
    create: { kode: 'CBG-01', nama: 'Cabang Bandung', tipe: 'CABANG', telepon: '022-1234567', alamat: 'Bandung, Jawa Barat' },
  });
  await prisma.cabang.upsert({
    where: { kode: 'CBG-02' },
    update: {},
    create: { kode: 'CBG-02', nama: 'Cabang Surabaya', tipe: 'CABANG', telepon: '031-1234567', alamat: 'Surabaya, Jawa Timur' },
  });
  await prisma.cabang.upsert({
    where: { kode: 'CBG-03' },
    update: {},
    create: { kode: 'CBG-03', nama: 'Cabang Yogyakarta', tipe: 'CABANG', telepon: '0274-1234567', alamat: 'Yogyakarta, DIY' },
  });

  // ============================================================
  // 5. PEMASOK
  // ============================================================
  await prisma.pemasok.upsert({
    where: { kode: 'PMS-FOTO-01' },
    update: {},
    create: {
      kode: 'PMS-FOTO-01',
      nama: 'Supplier Kertas Foto Jaya',
      kontak: 'Pak Budi',
      telepon: '081234567890',
      email: 'kertas.foto@jaya.com',
      alamat: 'Jakarta Barat',
    },
  });
  await prisma.pemasok.upsert({
    where: { kode: 'PMS-FOTO-02' },
    update: {},
    create: {
      kode: 'PMS-FOTO-02',
      nama: 'UD Aksesoris Snap',
      kontak: 'Ibu Sari',
      telepon: '082345678901',
      email: 'aksesori@snap.com',
      alamat: 'Bandung',
    },
  });
  await prisma.pemasok.upsert({
    where: { kode: 'PMS-KRPK-01' },
    update: {},
    create: {
      kode: 'PMS-KRPK-01',
      nama: 'CV Cemilan Nusantara',
      kontak: 'Pak Agus',
      telepon: '083456789012',
      email: 'cemilan@nusantara.com',
      alamat: 'Bandung',
    },
  });
  await prisma.pemasok.upsert({
    where: { kode: 'PMS-KRPK-02' },
    update: {},
    create: {
      kode: 'PMS-KRPK-02',
      nama: 'Pabrik Snack Sejahtera',
      kontak: 'Ibu Rina',
      telepon: '084567890123',
      email: 'snack@sejahtera.co.id',
      alamat: 'Garut, Jawa Barat',
    },
  });

  // ============================================================
  // 6. PRODUK FOTOSNAPS
  // ============================================================
  console.log('Seeding Fotosnaps products...');

  const produkFotosnaps = [
    {
      kodeProduk: 'FOTO-001',
      namaProduk: 'Roll Film',
      kategori: 'Film & Media',
      satuanId: roll.id,
      satuanPembelianId: dus.id,
      konversi: 10,
      minimumStok: 50,
      deskripsi: 'Roll film untuk kamera analog dan foto booth',
    },
    {
      kodeProduk: 'FOTO-002',
      namaProduk: 'Roll Jibbitz',
      kategori: 'Aksesoris Foto',
      satuanId: roll.id,
      satuanPembelianId: dus.id,
      konversi: 12,
      minimumStok: 30,
      deskripsi: 'Roll jibbitz untuk dekorasi foto booth',
    },
    {
      kodeProduk: 'FOTO-003',
      namaProduk: 'Snapclik 2D',
      kategori: 'Produk Foto',
      satuanId: pcs.id,
      satuanPembelianId: box.id,
      konversi: 10,
      minimumStok: 100,
      deskripsi: 'Foto snapclik format 2D standard',
    },
    {
      kodeProduk: 'FOTO-004',
      namaProduk: 'Snapclik Colorfull',
      kategori: 'Produk Foto',
      satuanId: pcs.id,
      satuanPembelianId: box.id,
      konversi: 10,
      minimumStok: 100,
      deskripsi: 'Foto snapclik format colorfull/warna-warni',
    },
    {
      kodeProduk: 'FOTO-005',
      namaProduk: 'Snapclik Frame Foto 3D',
      kategori: 'Produk Foto',
      satuanId: pcs.id,
      satuanPembelianId: box.id,
      konversi: 6,
      minimumStok: 50,
      deskripsi: 'Foto snapclik dengan frame 3D eksklusif',
    },
    {
      kodeProduk: 'FOTO-006',
      namaProduk: 'Lego',
      kategori: 'Aksesoris Jibbitz',
      satuanId: pcs.id,
      satuanPembelianId: pack.id,
      konversi: 20,
      minimumStok: 200,
      deskripsi: 'Badan lego untuk jibbitz foto',
    },
    {
      kodeProduk: 'FOTO-007',
      namaProduk: 'Kepala Lego Cowok',
      kategori: 'Aksesoris Jibbitz',
      satuanId: pcs.id,
      satuanPembelianId: pack.id,
      konversi: 20,
      minimumStok: 150,
      deskripsi: 'Kepala lego karakter cowok untuk jibbitz',
    },
    {
      kodeProduk: 'FOTO-008',
      namaProduk: 'Kepala Lego Cewek',
      kategori: 'Aksesoris Jibbitz',
      satuanId: pcs.id,
      satuanPembelianId: pack.id,
      konversi: 20,
      minimumStok: 150,
      deskripsi: 'Kepala lego karakter cewek untuk jibbitz',
    },
    {
      kodeProduk: 'FOTO-009',
      namaProduk: 'Rambut Lego Cowok',
      kategori: 'Aksesoris Jibbitz',
      satuanId: pcs.id,
      satuanPembelianId: pack.id,
      konversi: 20,
      minimumStok: 150,
      deskripsi: 'Rambut/wig lego karakter cowok',
    },
    {
      kodeProduk: 'FOTO-010',
      namaProduk: 'Rambut Lego Cewek',
      kategori: 'Aksesoris Jibbitz',
      satuanId: pcs.id,
      satuanPembelianId: pack.id,
      konversi: 20,
      minimumStok: 150,
      deskripsi: 'Rambut/wig lego karakter cewek',
    },
    {
      kodeProduk: 'FOTO-011',
      namaProduk: 'Kertas DNP QW410',
      kategori: 'Kertas Cetak',
      satuanId: pack.id,
      satuanPembelianId: dus.id,
      konversi: 6,
      minimumStok: 20,
      deskripsi: 'Kertas cetak foto DNP model QW410',
    },
    {
      kodeProduk: 'FOTO-012',
      namaProduk: 'Kertas HS-RX1',
      kategori: 'Kertas Cetak',
      satuanId: pack.id,
      satuanPembelianId: dus.id,
      konversi: 6,
      minimumStok: 20,
      deskripsi: 'Kertas cetak foto DNP model HS-RX1',
    },
    {
      kodeProduk: 'FOTO-013',
      namaProduk: 'Kertas DS620',
      kategori: 'Kertas Cetak',
      satuanId: pack.id,
      satuanPembelianId: dus.id,
      konversi: 6,
      minimumStok: 20,
      deskripsi: 'Kertas cetak foto DNP model DS620',
    },
    {
      kodeProduk: 'FOTO-014',
      namaProduk: 'Charm',
      kategori: 'Aksesoris Jibbitz',
      satuanId: pcs.id,
      satuanPembelianId: pack.id,
      konversi: 50,
      minimumStok: 500,
      deskripsi: 'Charm / gantungan kecil untuk jibbitz',
    },
    {
      kodeProduk: 'FOTO-015',
      namaProduk: 'Rantai Biji',
      kategori: 'Aksesoris Jibbitz',
      satuanId: meter.id,
      satuanPembelianId: roll.id,
      konversi: 50,
      minimumStok: 100,
      deskripsi: 'Rantai biji untuk jibbitz (per meter)',
    },
    {
      kodeProduk: 'FOTO-016',
      namaProduk: 'Resin',
      kategori: 'Bahan Produksi',
      satuanId: gram.id,
      satuanPembelianId: kg.id,
      konversi: 1000,
      minimumStok: 2000,
      deskripsi: 'Bahan resin untuk pembuatan jibbitz',
    },
    {
      kodeProduk: 'FOTO-017',
      namaProduk: 'Kertas Hologram',
      kategori: 'Kertas Cetak',
      satuanId: lembar.id,
      satuanPembelianId: pack.id,
      konversi: 50,
      minimumStok: 200,
      deskripsi: 'Kertas hologram efek pelangi untuk foto premium',
    },
    {
      kodeProduk: 'FOTO-018',
      namaProduk: 'Kertas Epson Transparan',
      kategori: 'Kertas Cetak',
      satuanId: lembar.id,
      satuanPembelianId: pack.id,
      konversi: 50,
      minimumStok: 100,
      deskripsi: 'Kertas Epson jenis transparan untuk cetak stiker',
    },
    {
      kodeProduk: 'FOTO-019',
      namaProduk: 'Kertas Epson Regular',
      kategori: 'Kertas Cetak',
      satuanId: lembar.id,
      satuanPembelianId: pack.id,
      konversi: 100,
      minimumStok: 200,
      deskripsi: 'Kertas Epson jenis regular untuk cetak foto biasa',
    },
    {
      kodeProduk: 'FOTO-020',
      namaProduk: 'Kertas Koran',
      kategori: 'Kertas Cetak',
      satuanId: lembar.id,
      satuanPembelianId: dus.id,
      konversi: 500,
      minimumStok: 1000,
      deskripsi: 'Kertas koran untuk pembungkus/dekorasi foto',
    },
  ];

  for (const p of produkFotosnaps) {
    await prisma.produk.upsert({
      where: { kodeProduk: p.kodeProduk },
      update: {
        namaProduk: p.namaProduk,
        kategori: p.kategori,
        unitBisnis: 'FOTOSNAPS',
        satuanId: p.satuanId,
        satuanPembelianId: p.satuanPembelianId,
        konversi: p.konversi,
        minimumStok: p.minimumStok,
        deskripsi: p.deskripsi,
      },
      create: {
        kodeProduk: p.kodeProduk,
        namaProduk: p.namaProduk,
        kategori: p.kategori,
        unitBisnis: 'FOTOSNAPS',
        satuanId: p.satuanId,
        satuanPembelianId: p.satuanPembelianId,
        konversi: p.konversi,
        minimumStok: p.minimumStok,
        deskripsi: p.deskripsi,
        status: 'aktif',
      },
    });
    console.log(`  + Fotosnaps: ${p.namaProduk}`);
  }

  // ============================================================
  // 7. PRODUK KERIPIK BUJANGAN
  // ============================================================
  console.log('Seeding Keripik Bujangan products...');

  const produkKeripik = [
    {
      kodeProduk: 'KRPK-001',
      namaProduk: 'Basreng',
      kategori: 'Makanan Ringan',
      satuanId: pack.id,
      satuanPembelianId: dus.id,
      konversi: 24,
      minimumStok: 50,
      deskripsi: 'Basreng (Bakso Goreng) pedas / original',
    },
    {
      kodeProduk: 'KRPK-002',
      namaProduk: 'Keripik Singkong',
      kategori: 'Makanan Ringan',
      satuanId: pack.id,
      satuanPembelianId: dus.id,
      konversi: 24,
      minimumStok: 50,
      deskripsi: 'Keripik singkong berbagai rasa',
    },
    {
      kodeProduk: 'KRPK-003',
      namaProduk: 'Cimol',
      kategori: 'Makanan Ringan',
      satuanId: pack.id,
      satuanPembelianId: dus.id,
      konversi: 20,
      minimumStok: 40,
      deskripsi: 'Cimol (Aci di Mol) bumbu pedas',
    },
    {
      kodeProduk: 'KRPK-004',
      namaProduk: 'Batagor',
      kategori: 'Makanan Ringan',
      satuanId: pack.id,
      satuanPembelianId: dus.id,
      konversi: 20,
      minimumStok: 40,
      deskripsi: 'Batagor (Bakso Tahu Goreng) renyah',
    },
    {
      kodeProduk: 'KRPK-005',
      namaProduk: 'Chocoball',
      kategori: 'Makanan Ringan',
      satuanId: pack.id,
      satuanPembelianId: dus.id,
      konversi: 24,
      minimumStok: 30,
      deskripsi: 'Bola coklat renyah (chocoball)',
    },
    {
      kodeProduk: 'KRPK-006',
      namaProduk: 'Pilus Arab',
      kategori: 'Makanan Ringan',
      satuanId: pack.id,
      satuanPembelianId: dus.id,
      konversi: 24,
      minimumStok: 40,
      deskripsi: 'Pilus arab / snack bumbu khas arab',
    },
    {
      kodeProduk: 'KRPK-007',
      namaProduk: 'Makaroni',
      kategori: 'Makanan Ringan',
      satuanId: pack.id,
      satuanPembelianId: dus.id,
      konversi: 24,
      minimumStok: 50,
      deskripsi: 'Makaroni goreng renyah berbagai rasa',
    },
  ];

  for (const p of produkKeripik) {
    await prisma.produk.upsert({
      where: { kodeProduk: p.kodeProduk },
      update: {
        namaProduk: p.namaProduk,
        kategori: p.kategori,
        unitBisnis: 'KERIPIK_BUJANGAN',
        satuanId: p.satuanId,
        satuanPembelianId: p.satuanPembelianId,
        konversi: p.konversi,
        minimumStok: p.minimumStok,
        deskripsi: p.deskripsi,
      },
      create: {
        kodeProduk: p.kodeProduk,
        namaProduk: p.namaProduk,
        kategori: p.kategori,
        unitBisnis: 'KERIPIK_BUJANGAN',
        satuanId: p.satuanId,
        satuanPembelianId: p.satuanPembelianId,
        konversi: p.konversi,
        minimumStok: p.minimumStok,
        deskripsi: p.deskripsi,
        status: 'aktif',
      },
    });
    console.log(`  + Keripik: ${p.namaProduk}`);
  }

  // ============================================================
  // 8. GUDANG
  // ============================================================
  await prisma.gudang.upsert({
    where: { kode: 'GDG-PUSAT' },
    update: {},
    create: { kode: 'GDG-PUSAT', nama: 'Gudang Pusat', alamat: 'Jl. Gudang Raya No. 1, Jakarta' },
  });
  await prisma.gudang.upsert({
    where: { kode: 'GDG-FOTO' },
    update: {},
    create: { kode: 'GDG-FOTO', nama: 'Gudang Fotosnaps', alamat: 'Jl. Fotosnaps No. 5, Bandung' },
  });
  await prisma.gudang.upsert({
    where: { kode: 'GDG-KRPK' },
    update: {},
    create: { kode: 'GDG-KRPK', nama: 'Gudang Keripik Bujangan', alamat: 'Jl. Snack Raya No. 12, Garut' },
  });

  console.log('Seeding finished. Summary:');
  console.log(`  - ${produkFotosnaps.length} produk Fotosnaps`);
  console.log(`  - ${produkKeripik.length} produk Keripik Bujangan`);
  console.log('  - Satuan: PCS, BOX, BAL, PACK, ROLL, LEMBAR, DUS, KG, SET, METER, GR');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
