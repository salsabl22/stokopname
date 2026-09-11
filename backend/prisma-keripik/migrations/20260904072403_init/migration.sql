-- CreateTable
CREATE TABLE `Role` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Role_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Permission` (
    `id` VARCHAR(191) NOT NULL,
    `roleId` VARCHAR(191) NOT NULL,
    `modul` VARCHAR(191) NOT NULL,
    `lihat` BOOLEAN NOT NULL DEFAULT false,
    `buat` BOOLEAN NOT NULL DEFAULT false,
    `ubah` BOOLEAN NOT NULL DEFAULT false,
    `hapus` BOOLEAN NOT NULL DEFAULT false,
    `proses` BOOLEAN NOT NULL DEFAULT false,
    `setujui` BOOLEAN NOT NULL DEFAULT false,
    `export` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `Permission_roleId_modul_key`(`roleId`, `modul`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserPermission` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `modul` VARCHAR(191) NOT NULL,
    `lihat` BOOLEAN NOT NULL DEFAULT false,
    `buat` BOOLEAN NOT NULL DEFAULT false,
    `ubah` BOOLEAN NOT NULL DEFAULT false,
    `hapus` BOOLEAN NOT NULL DEFAULT false,
    `proses` BOOLEAN NOT NULL DEFAULT false,
    `setujui` BOOLEAN NOT NULL DEFAULT false,
    `export` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `UserPermission_userId_modul_key`(`userId`, `modul`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `roleId` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SatuanBarang` (
    `id` VARCHAR(191) NOT NULL,
    `kode` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `deskripsi` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `SatuanBarang_kode_key`(`kode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `KonversiSatuan` (
    `id` VARCHAR(191) NOT NULL,
    `produkId` VARCHAR(191) NULL,
    `satuanBesarId` VARCHAR(191) NOT NULL,
    `satuanKecilId` VARCHAR(191) NOT NULL,
    `nilaiKonversi` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `KonversiSatuan_produkId_satuanBesarId_satuanKecilId_key`(`produkId`, `satuanBesarId`, `satuanKecilId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Produk` (
    `id` VARCHAR(191) NOT NULL,
    `kodeProduk` VARCHAR(191) NOT NULL,
    `namaProduk` VARCHAR(191) NOT NULL,
    `kategori` VARCHAR(191) NOT NULL,
    `unitBisnis` VARCHAR(191) NOT NULL DEFAULT 'FOTOSNAPS',
    `satuanId` VARCHAR(191) NULL,
    `satuanPembelianId` VARCHAR(191) NULL,
    `konversi` DOUBLE NOT NULL DEFAULT 1,
    `minimumStok` DOUBLE NOT NULL DEFAULT 0,
    `trackBatch` BOOLEAN NOT NULL DEFAULT false,
    `status` VARCHAR(191) NOT NULL DEFAULT 'aktif',
    `deskripsi` VARCHAR(191) NULL,
    `hargaBeli` DOUBLE NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Produk_kodeProduk_key`(`kodeProduk`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Batch` (
    `id` VARCHAR(191) NOT NULL,
    `nomorBatch` VARCHAR(191) NOT NULL,
    `produkId` VARCHAR(191) NOT NULL,
    `tanggalProduksi` DATETIME(3) NULL,
    `tanggalKedaluwarsa` DATETIME(3) NULL,
    `jumlahAwal` DOUBLE NOT NULL DEFAULT 0,
    `jumlahSisa` DOUBLE NOT NULL DEFAULT 0,
    `status` VARCHAR(191) NOT NULL DEFAULT 'aktif',
    `referensiPO` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Batch_nomorBatch_produkId_key`(`nomorBatch`, `produkId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pemasok` (
    `id` VARCHAR(191) NOT NULL,
    `kode` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `kontak` VARCHAR(191) NULL,
    `telepon` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `alamat` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'aktif',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Pemasok_kode_key`(`kode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cabang` (
    `id` VARCHAR(191) NOT NULL,
    `kode` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `tipe` VARCHAR(191) NOT NULL DEFAULT 'CABANG',
    `telepon` VARCHAR(191) NULL,
    `alamat` VARCHAR(191) NULL,
    `pic` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'aktif',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Cabang_kode_key`(`kode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Gudang` (
    `id` VARCHAR(191) NOT NULL,
    `kode` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `alamat` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'aktif',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Gudang_kode_key`(`kode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Zona` (
    `id` VARCHAR(191) NOT NULL,
    `kode` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `gudangId` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'aktif',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Zona_gudangId_kode_key`(`gudangId`, `kode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Rak` (
    `id` VARCHAR(191) NOT NULL,
    `kode` VARCHAR(191) NOT NULL,
    `zonaId` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'aktif',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Rak_zonaId_kode_key`(`zonaId`, `kode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Lokasi` (
    `id` VARCHAR(191) NOT NULL,
    `kode` VARCHAR(191) NOT NULL,
    `tipe` VARCHAR(191) NOT NULL,
    `rakId` VARCHAR(191) NOT NULL,
    `kapasitas` DOUBLE NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'aktif',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Lokasi_rakId_kode_key`(`rakId`, `kode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PurchaseOrder` (
    `id` VARCHAR(191) NOT NULL,
    `nomorPO` VARCHAR(191) NOT NULL,
    `tanggal` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `tanggalTargetKedatangan` DATETIME(3) NULL,
    `pemasokId` VARCHAR(191) NOT NULL,
    `totalPesanan` DOUBLE NOT NULL DEFAULT 0,
    `status` VARCHAR(191) NOT NULL DEFAULT 'draft',
    `barangSesuai` BOOLEAN NULL,
    `jumlahSesuai` BOOLEAN NULL,
    `catatanSelisih` VARCHAR(191) NULL,
    `hasilQC` VARCHAR(191) NULL,
    `perluRepack` BOOLEAN NULL,
    `catatanQC` VARCHAR(191) NULL,
    `lokasiPenyimpanan` VARCHAR(191) NULL,
    `nomorPenerimaan` VARCHAR(191) NULL,
    `nomorQC` VARCHAR(191) NULL,
    `nomorPutaway` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PurchaseOrder_nomorPO_key`(`nomorPO`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `POItem` (
    `id` VARCHAR(191) NOT NULL,
    `poId` VARCHAR(191) NOT NULL,
    `produkId` VARCHAR(191) NOT NULL,
    `satuan` VARCHAR(191) NOT NULL,
    `jumlahPesan` DOUBLE NOT NULL,
    `jumlahDiterima` DOUBLE NULL,
    `hargaSatuan` DOUBLE NOT NULL,
    `batchId` VARCHAR(191) NULL,
    `tanggalProduksi` DATETIME(3) NULL,
    `tanggalKedaluwarsa` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Inventory` (
    `id` VARCHAR(191) NOT NULL,
    `produkId` VARCHAR(191) NOT NULL,
    `lokasiId` VARCHAR(191) NULL,
    `batchId` VARCHAR(191) NULL,
    `jumlahTersedia` DOUBLE NOT NULL DEFAULT 0,
    `jumlahDialokasikan` DOUBLE NOT NULL DEFAULT 0,
    `jumlahKarantina` DOUBLE NOT NULL DEFAULT 0,
    `jumlahWaste` DOUBLE NOT NULL DEFAULT 0,
    `minimumStok` DOUBLE NOT NULL DEFAULT 0,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SalesOrder` (
    `id` VARCHAR(191) NOT NULL,
    `nomorSO` VARCHAR(191) NOT NULL,
    `tanggal` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `deadline` DATETIME(3) NULL,
    `cabangId` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'draft',
    `prioritas` VARCHAR(191) NOT NULL DEFAULT 'NORMAL',
    `catatan` VARCHAR(191) NULL,
    `nomorPicking` VARCHAR(191) NULL,
    `nomorPacking` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `SalesOrder_nomorSO_key`(`nomorSO`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SOItem` (
    `id` VARCHAR(191) NOT NULL,
    `soId` VARCHAR(191) NOT NULL,
    `produkId` VARCHAR(191) NOT NULL,
    `satuan` VARCHAR(191) NOT NULL,
    `jumlahPesan` DOUBLE NOT NULL,
    `jumlahAlokasi` DOUBLE NOT NULL DEFAULT 0,
    `jumlahPick` DOUBLE NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PackingResult` (
    `id` VARCHAR(191) NOT NULL,
    `soItemId` VARCHAR(191) NOT NULL,
    `produkId` VARCHAR(191) NOT NULL,
    `nomorPacking` VARCHAR(191) NULL,
    `jumlahAwal` DOUBLE NOT NULL,
    `satuanAwal` VARCHAR(191) NOT NULL DEFAULT 'PCS',
    `satuanKemasan` VARCHAR(191) NOT NULL,
    `jumlahKemasan` DOUBLE NOT NULL,
    `satuanSisa` VARCHAR(191) NOT NULL DEFAULT 'PCS',
    `sisaJumlah` DOUBLE NOT NULL,
    `petugasId` VARCHAR(191) NULL,
    `waktuMulai` DATETIME(3) NULL,
    `waktuSelesai` DATETIME(3) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'SELESAI',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `PackingResult_soItemId_key`(`soItemId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StockMovement` (
    `id` VARCHAR(191) NOT NULL,
    `produkId` VARCHAR(191) NOT NULL,
    `tipe` VARCHAR(191) NOT NULL,
    `jumlah` DOUBLE NOT NULL,
    `keterangan` VARCHAR(191) NULL,
    `referensi` VARCHAR(191) NULL,
    `nomorDokumen` VARCHAR(191) NULL,
    `lokasiAsal` VARCHAR(191) NULL,
    `lokasiTujuan` VARCHAR(191) NULL,
    `batchId` VARCHAR(191) NULL,
    `userId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Shipment` (
    `id` VARCHAR(191) NOT NULL,
    `nomorSJ` VARCHAR(191) NOT NULL,
    `soId` VARCHAR(191) NOT NULL,
    `metodePengiriman` VARCHAR(191) NULL,
    `tanggalPengiriman` DATETIME(3) NULL,
    `estimasiTiba` DATETIME(3) NULL,
    `tanggalAktualTiba` DATETIME(3) NULL,
    `keteranganPengiriman` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'siap_kirim',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Shipment_nomorSJ_key`(`nomorSJ`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Retur` (
    `id` VARCHAR(191) NOT NULL,
    `nomorRetur` VARCHAR(191) NOT NULL,
    `soId` VARCHAR(191) NULL,
    `cabangId` VARCHAR(191) NOT NULL,
    `alasan` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'diajukan',
    `kondisi` VARCHAR(191) NULL,
    `catatan` VARCHAR(191) NULL,
    `tanggalPengajuan` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `tanggalPersetujuan` DATETIME(3) NULL,
    `tanggalPenerimaan` DATETIME(3) NULL,
    `tanggalPemeriksaan` DATETIME(3) NULL,
    `tanggalKeputusan` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Retur_nomorRetur_key`(`nomorRetur`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FotoRetur` (
    `id` VARCHAR(191) NOT NULL,
    `returId` VARCHAR(191) NOT NULL,
    `filePath` VARCHAR(191) NOT NULL,
    `fileName` VARCHAR(191) NOT NULL,
    `mimeType` VARCHAR(191) NOT NULL DEFAULT 'image/jpeg',
    `ukuranBytes` INTEGER NULL,
    `keterangan` VARCHAR(191) NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `uploadedBy` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ReturItem` (
    `id` VARCHAR(191) NOT NULL,
    `returId` VARCHAR(191) NOT NULL,
    `produkId` VARCHAR(191) NOT NULL,
    `satuan` VARCHAR(191) NOT NULL,
    `jumlah` DOUBLE NOT NULL,
    `batchId` VARCHAR(191) NULL,
    `kondisi` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CycleCount` (
    `id` VARCHAR(191) NOT NULL,
    `nomorCC` VARCHAR(191) NOT NULL,
    `tanggal` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `gudangId` VARCHAR(191) NOT NULL,
    `petugasId` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'draft',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `CycleCount_nomorCC_key`(`nomorCC`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CycleCountItem` (
    `id` VARCHAR(191) NOT NULL,
    `cycleCountId` VARCHAR(191) NOT NULL,
    `produkId` VARCHAR(191) NOT NULL,
    `lokasiId` VARCHAR(191) NULL,
    `satuan` VARCHAR(191) NOT NULL DEFAULT 'PCS',
    `stokSistem` DOUBLE NOT NULL,
    `stokFisik` DOUBLE NOT NULL DEFAULT 0,
    `selisih` DOUBLE NOT NULL DEFAULT 0,
    `alasan` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StockAdjustment` (
    `id` VARCHAR(191) NOT NULL,
    `nomorADJ` VARCHAR(191) NOT NULL,
    `produkId` VARCHAR(191) NOT NULL,
    `lokasiId` VARCHAR(191) NULL,
    `jumlahLama` DOUBLE NOT NULL,
    `jumlahBaru` DOUBLE NOT NULL,
    `selisih` DOUBLE NOT NULL,
    `alasan` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'menunggu',
    `pengajuId` VARCHAR(191) NULL,
    `penyetujuId` VARCHAR(191) NULL,
    `tanggalSetuju` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `StockAdjustment_nomorADJ_key`(`nomorADJ`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ExceptionLog` (
    `id` VARCHAR(191) NOT NULL,
    `nomorEXC` VARCHAR(191) NULL,
    `tipe` VARCHAR(191) NOT NULL,
    `referensi` VARCHAR(191) NULL,
    `pemasokId` VARCHAR(191) NULL,
    `produkId` VARCHAR(191) NULL,
    `keterangan` VARCHAR(191) NOT NULL,
    `alasanPengembalian` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `resolvedBy` VARCHAR(191) NULL,
    `resolvedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FotoPengembalianPemasok` (
    `id` VARCHAR(191) NOT NULL,
    `exceptionLogId` VARCHAR(191) NOT NULL,
    `filePath` VARCHAR(191) NOT NULL,
    `fileName` VARCHAR(191) NOT NULL,
    `mimeType` VARCHAR(191) NOT NULL DEFAULT 'image/jpeg',
    `ukuranBytes` INTEGER NULL,
    `keterangan` VARCHAR(191) NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `uploadedBy` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Waste` (
    `id` VARCHAR(191) NOT NULL,
    `nomorWaste` VARCHAR(191) NULL,
    `produkId` VARCHAR(191) NOT NULL,
    `batchId` VARCHAR(191) NULL,
    `lokasiId` VARCHAR(191) NULL,
    `jumlah` DOUBLE NOT NULL,
    `satuan` VARCHAR(191) NOT NULL DEFAULT 'PCS',
    `alasan` VARCHAR(191) NOT NULL,
    `referensi` VARCHAR(191) NULL,
    `petugasId` VARCHAR(191) NULL,
    `approval` VARCHAR(191) NOT NULL DEFAULT 'auto',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Task` (
    `id` VARCHAR(191) NOT NULL,
    `nomorTugas` VARCHAR(191) NOT NULL,
    `jenis` VARCHAR(191) NOT NULL,
    `referensiId` VARCHAR(191) NULL,
    `deskripsi` VARCHAR(191) NOT NULL,
    `prioritas` VARCHAR(191) NOT NULL DEFAULT 'NORMAL',
    `assignedTo` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'MENUNGGU',
    `deadline` DATETIME(3) NULL,
    `waktuMulai` DATETIME(3) NULL,
    `waktuSelesai` DATETIME(3) NULL,
    `catatan` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Task_nomorTugas_key`(`nomorTugas`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notification` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `judul` VARCHAR(191) NOT NULL,
    `pesan` VARCHAR(191) NOT NULL,
    `tipe` VARCHAR(191) NOT NULL,
    `referensiId` VARCHAR(191) NULL,
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ActivityLog` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `aksi` VARCHAR(191) NOT NULL,
    `modul` VARCHAR(191) NOT NULL,
    `referensiId` VARCHAR(191) NULL,
    `nomorDokumen` VARCHAR(191) NULL,
    `detail` VARCHAR(191) NULL,
    `dataSebelum` VARCHAR(191) NULL,
    `dataSesudah` VARCHAR(191) NULL,
    `ipAddress` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Permission` ADD CONSTRAINT `Permission_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Role`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserPermission` ADD CONSTRAINT `UserPermission_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Role`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `KonversiSatuan` ADD CONSTRAINT `KonversiSatuan_produkId_fkey` FOREIGN KEY (`produkId`) REFERENCES `Produk`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `KonversiSatuan` ADD CONSTRAINT `KonversiSatuan_satuanBesarId_fkey` FOREIGN KEY (`satuanBesarId`) REFERENCES `SatuanBarang`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `KonversiSatuan` ADD CONSTRAINT `KonversiSatuan_satuanKecilId_fkey` FOREIGN KEY (`satuanKecilId`) REFERENCES `SatuanBarang`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Produk` ADD CONSTRAINT `Produk_satuanId_fkey` FOREIGN KEY (`satuanId`) REFERENCES `SatuanBarang`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Produk` ADD CONSTRAINT `Produk_satuanPembelianId_fkey` FOREIGN KEY (`satuanPembelianId`) REFERENCES `SatuanBarang`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Batch` ADD CONSTRAINT `Batch_produkId_fkey` FOREIGN KEY (`produkId`) REFERENCES `Produk`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Zona` ADD CONSTRAINT `Zona_gudangId_fkey` FOREIGN KEY (`gudangId`) REFERENCES `Gudang`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Rak` ADD CONSTRAINT `Rak_zonaId_fkey` FOREIGN KEY (`zonaId`) REFERENCES `Zona`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Lokasi` ADD CONSTRAINT `Lokasi_rakId_fkey` FOREIGN KEY (`rakId`) REFERENCES `Rak`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseOrder` ADD CONSTRAINT `PurchaseOrder_pemasokId_fkey` FOREIGN KEY (`pemasokId`) REFERENCES `Pemasok`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `POItem` ADD CONSTRAINT `POItem_poId_fkey` FOREIGN KEY (`poId`) REFERENCES `PurchaseOrder`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `POItem` ADD CONSTRAINT `POItem_produkId_fkey` FOREIGN KEY (`produkId`) REFERENCES `Produk`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `POItem` ADD CONSTRAINT `POItem_batchId_fkey` FOREIGN KEY (`batchId`) REFERENCES `Batch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inventory` ADD CONSTRAINT `Inventory_produkId_fkey` FOREIGN KEY (`produkId`) REFERENCES `Produk`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inventory` ADD CONSTRAINT `Inventory_lokasiId_fkey` FOREIGN KEY (`lokasiId`) REFERENCES `Lokasi`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inventory` ADD CONSTRAINT `Inventory_batchId_fkey` FOREIGN KEY (`batchId`) REFERENCES `Batch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesOrder` ADD CONSTRAINT `SalesOrder_cabangId_fkey` FOREIGN KEY (`cabangId`) REFERENCES `Cabang`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SOItem` ADD CONSTRAINT `SOItem_soId_fkey` FOREIGN KEY (`soId`) REFERENCES `SalesOrder`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SOItem` ADD CONSTRAINT `SOItem_produkId_fkey` FOREIGN KEY (`produkId`) REFERENCES `Produk`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PackingResult` ADD CONSTRAINT `PackingResult_soItemId_fkey` FOREIGN KEY (`soItemId`) REFERENCES `SOItem`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PackingResult` ADD CONSTRAINT `PackingResult_produkId_fkey` FOREIGN KEY (`produkId`) REFERENCES `Produk`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockMovement` ADD CONSTRAINT `StockMovement_produkId_fkey` FOREIGN KEY (`produkId`) REFERENCES `Produk`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Shipment` ADD CONSTRAINT `Shipment_soId_fkey` FOREIGN KEY (`soId`) REFERENCES `SalesOrder`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Retur` ADD CONSTRAINT `Retur_soId_fkey` FOREIGN KEY (`soId`) REFERENCES `SalesOrder`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Retur` ADD CONSTRAINT `Retur_cabangId_fkey` FOREIGN KEY (`cabangId`) REFERENCES `Cabang`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FotoRetur` ADD CONSTRAINT `FotoRetur_returId_fkey` FOREIGN KEY (`returId`) REFERENCES `Retur`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReturItem` ADD CONSTRAINT `ReturItem_returId_fkey` FOREIGN KEY (`returId`) REFERENCES `Retur`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReturItem` ADD CONSTRAINT `ReturItem_batchId_fkey` FOREIGN KEY (`batchId`) REFERENCES `Batch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CycleCountItem` ADD CONSTRAINT `CycleCountItem_cycleCountId_fkey` FOREIGN KEY (`cycleCountId`) REFERENCES `CycleCount`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ExceptionLog` ADD CONSTRAINT `ExceptionLog_produkId_fkey` FOREIGN KEY (`produkId`) REFERENCES `Produk`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FotoPengembalianPemasok` ADD CONSTRAINT `FotoPengembalianPemasok_exceptionLogId_fkey` FOREIGN KEY (`exceptionLogId`) REFERENCES `ExceptionLog`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Waste` ADD CONSTRAINT `Waste_produkId_fkey` FOREIGN KEY (`produkId`) REFERENCES `Produk`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Waste` ADD CONSTRAINT `Waste_batchId_fkey` FOREIGN KEY (`batchId`) REFERENCES `Batch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Waste` ADD CONSTRAINT `Waste_lokasiId_fkey` FOREIGN KEY (`lokasiId`) REFERENCES `Lokasi`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Task` ADD CONSTRAINT `Task_assignedTo_fkey` FOREIGN KEY (`assignedTo`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ActivityLog` ADD CONSTRAINT `ActivityLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
