-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "roleId" TEXT NOT NULL,
    "modul" TEXT NOT NULL,
    "lihat" BOOLEAN NOT NULL DEFAULT false,
    "buat" BOOLEAN NOT NULL DEFAULT false,
    "ubah" BOOLEAN NOT NULL DEFAULT false,
    "hapus" BOOLEAN NOT NULL DEFAULT false,
    "proses" BOOLEAN NOT NULL DEFAULT false,
    "setujui" BOOLEAN NOT NULL DEFAULT false,
    "export" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Permission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserPermission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "modul" TEXT NOT NULL,
    "lihat" BOOLEAN NOT NULL DEFAULT false,
    "buat" BOOLEAN NOT NULL DEFAULT false,
    "ubah" BOOLEAN NOT NULL DEFAULT false,
    "hapus" BOOLEAN NOT NULL DEFAULT false,
    "proses" BOOLEAN NOT NULL DEFAULT false,
    "setujui" BOOLEAN NOT NULL DEFAULT false,
    "export" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "UserPermission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "roleId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SatuanBarang" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "deskripsi" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "KonversiSatuan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "produkId" TEXT,
    "satuanBesarId" TEXT NOT NULL,
    "satuanKecilId" TEXT NOT NULL,
    "nilaiKonversi" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "KonversiSatuan_produkId_fkey" FOREIGN KEY ("produkId") REFERENCES "Produk" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "KonversiSatuan_satuanBesarId_fkey" FOREIGN KEY ("satuanBesarId") REFERENCES "SatuanBarang" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "KonversiSatuan_satuanKecilId_fkey" FOREIGN KEY ("satuanKecilId") REFERENCES "SatuanBarang" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Produk" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "kodeProduk" TEXT NOT NULL,
    "namaProduk" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "satuanId" TEXT,
    "satuanPembelianId" TEXT,
    "konversi" REAL NOT NULL,
    "minimumStok" REAL NOT NULL DEFAULT 0,
    "trackBatch" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'aktif',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Produk_satuanId_fkey" FOREIGN KEY ("satuanId") REFERENCES "SatuanBarang" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Produk_satuanPembelianId_fkey" FOREIGN KEY ("satuanPembelianId") REFERENCES "SatuanBarang" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Batch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nomorBatch" TEXT NOT NULL,
    "produkId" TEXT NOT NULL,
    "tanggalProduksi" DATETIME,
    "tanggalKedaluwarsa" DATETIME,
    "jumlahAwal" REAL NOT NULL DEFAULT 0,
    "jumlahSisa" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'aktif',
    "referensiPO" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Batch_produkId_fkey" FOREIGN KEY ("produkId") REFERENCES "Produk" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Pemasok" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "kontak" TEXT,
    "telepon" TEXT,
    "email" TEXT,
    "alamat" TEXT,
    "status" TEXT NOT NULL DEFAULT 'aktif',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Cabang" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "tipe" TEXT NOT NULL DEFAULT 'CABANG',
    "telepon" TEXT,
    "alamat" TEXT,
    "pic" TEXT,
    "status" TEXT NOT NULL DEFAULT 'aktif',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Gudang" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "alamat" TEXT,
    "status" TEXT NOT NULL DEFAULT 'aktif',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Zona" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "gudangId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'aktif',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Zona_gudangId_fkey" FOREIGN KEY ("gudangId") REFERENCES "Gudang" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Rak" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "kode" TEXT NOT NULL,
    "zonaId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'aktif',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Rak_zonaId_fkey" FOREIGN KEY ("zonaId") REFERENCES "Zona" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Lokasi" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "kode" TEXT NOT NULL,
    "tipe" TEXT NOT NULL,
    "rakId" TEXT NOT NULL,
    "kapasitas" REAL,
    "status" TEXT NOT NULL DEFAULT 'aktif',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Lokasi_rakId_fkey" FOREIGN KEY ("rakId") REFERENCES "Rak" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PurchaseOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nomorPO" TEXT NOT NULL,
    "tanggal" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tanggalTargetKedatangan" DATETIME,
    "pemasokId" TEXT NOT NULL,
    "totalPesanan" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "barangSesuai" BOOLEAN,
    "jumlahSesuai" BOOLEAN,
    "catatanSelisih" TEXT,
    "hasilQC" TEXT,
    "perluRepack" BOOLEAN,
    "catatanQC" TEXT,
    "lokasiPenyimpanan" TEXT,
    "nomorPenerimaan" TEXT,
    "nomorQC" TEXT,
    "nomorPutaway" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PurchaseOrder_pemasokId_fkey" FOREIGN KEY ("pemasokId") REFERENCES "Pemasok" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "POItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "poId" TEXT NOT NULL,
    "produkId" TEXT NOT NULL,
    "satuan" TEXT NOT NULL,
    "jumlahPesan" REAL NOT NULL,
    "jumlahDiterima" REAL,
    "hargaSatuan" REAL NOT NULL,
    "batchId" TEXT,
    "tanggalProduksi" DATETIME,
    "tanggalKedaluwarsa" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "POItem_poId_fkey" FOREIGN KEY ("poId") REFERENCES "PurchaseOrder" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "POItem_produkId_fkey" FOREIGN KEY ("produkId") REFERENCES "Produk" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "POItem_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Inventory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "produkId" TEXT NOT NULL,
    "lokasiId" TEXT,
    "batchId" TEXT,
    "jumlahTersedia" REAL NOT NULL DEFAULT 0,
    "jumlahDialokasikan" REAL NOT NULL DEFAULT 0,
    "jumlahKarantina" REAL NOT NULL DEFAULT 0,
    "jumlahWaste" REAL NOT NULL DEFAULT 0,
    "minimumStok" REAL NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Inventory_produkId_fkey" FOREIGN KEY ("produkId") REFERENCES "Produk" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Inventory_lokasiId_fkey" FOREIGN KEY ("lokasiId") REFERENCES "Lokasi" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Inventory_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SalesOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nomorSO" TEXT NOT NULL,
    "tanggal" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deadline" DATETIME,
    "cabangId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "prioritas" TEXT NOT NULL DEFAULT 'NORMAL',
    "catatan" TEXT,
    "nomorPicking" TEXT,
    "nomorPacking" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SalesOrder_cabangId_fkey" FOREIGN KEY ("cabangId") REFERENCES "Cabang" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SOItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "soId" TEXT NOT NULL,
    "produkId" TEXT NOT NULL,
    "satuan" TEXT NOT NULL,
    "jumlahPesan" REAL NOT NULL,
    "jumlahAlokasi" REAL NOT NULL DEFAULT 0,
    "jumlahPick" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SOItem_soId_fkey" FOREIGN KEY ("soId") REFERENCES "SalesOrder" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SOItem_produkId_fkey" FOREIGN KEY ("produkId") REFERENCES "Produk" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PackingResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "soItemId" TEXT NOT NULL,
    "produkId" TEXT NOT NULL,
    "nomorPacking" TEXT,
    "jumlahAwal" REAL NOT NULL,
    "satuanAwal" TEXT NOT NULL DEFAULT 'PCS',
    "satuanKemasan" TEXT NOT NULL,
    "jumlahKemasan" REAL NOT NULL,
    "satuanSisa" TEXT NOT NULL DEFAULT 'PCS',
    "sisaJumlah" REAL NOT NULL,
    "petugasId" TEXT,
    "waktuMulai" DATETIME,
    "waktuSelesai" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'SELESAI',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PackingResult_soItemId_fkey" FOREIGN KEY ("soItemId") REFERENCES "SOItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PackingResult_produkId_fkey" FOREIGN KEY ("produkId") REFERENCES "Produk" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StockMovement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "produkId" TEXT NOT NULL,
    "tipe" TEXT NOT NULL,
    "jumlah" REAL NOT NULL,
    "keterangan" TEXT,
    "referensi" TEXT,
    "nomorDokumen" TEXT,
    "lokasiAsal" TEXT,
    "lokasiTujuan" TEXT,
    "batchId" TEXT,
    "userId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StockMovement_produkId_fkey" FOREIGN KEY ("produkId") REFERENCES "Produk" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Shipment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nomorSJ" TEXT NOT NULL,
    "soId" TEXT NOT NULL,
    "metodePengiriman" TEXT,
    "tanggalPengiriman" DATETIME,
    "estimasiTiba" DATETIME,
    "tanggalAktualTiba" DATETIME,
    "keteranganPengiriman" TEXT,
    "status" TEXT NOT NULL DEFAULT 'siap_kirim',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Shipment_soId_fkey" FOREIGN KEY ("soId") REFERENCES "SalesOrder" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Retur" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nomorRetur" TEXT NOT NULL,
    "soId" TEXT,
    "cabangId" TEXT NOT NULL,
    "alasan" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'diajukan',
    "kondisi" TEXT,
    "catatan" TEXT,
    "tanggalPengajuan" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tanggalPersetujuan" DATETIME,
    "tanggalPenerimaan" DATETIME,
    "tanggalPemeriksaan" DATETIME,
    "tanggalKeputusan" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Retur_soId_fkey" FOREIGN KEY ("soId") REFERENCES "SalesOrder" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Retur_cabangId_fkey" FOREIGN KEY ("cabangId") REFERENCES "Cabang" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReturItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "returId" TEXT NOT NULL,
    "produkId" TEXT NOT NULL,
    "satuan" TEXT NOT NULL,
    "jumlah" REAL NOT NULL,
    "batchId" TEXT,
    "kondisi" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReturItem_returId_fkey" FOREIGN KEY ("returId") REFERENCES "Retur" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ReturItem_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CycleCount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nomorCC" TEXT NOT NULL,
    "tanggal" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gudangId" TEXT NOT NULL,
    "petugasId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CycleCountItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cycleCountId" TEXT NOT NULL,
    "produkId" TEXT NOT NULL,
    "lokasiId" TEXT,
    "satuan" TEXT NOT NULL DEFAULT 'PCS',
    "stokSistem" REAL NOT NULL,
    "stokFisik" REAL NOT NULL DEFAULT 0,
    "selisih" REAL NOT NULL DEFAULT 0,
    "alasan" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CycleCountItem_cycleCountId_fkey" FOREIGN KEY ("cycleCountId") REFERENCES "CycleCount" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StockAdjustment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nomorADJ" TEXT NOT NULL,
    "produkId" TEXT NOT NULL,
    "lokasiId" TEXT,
    "jumlahLama" REAL NOT NULL,
    "jumlahBaru" REAL NOT NULL,
    "selisih" REAL NOT NULL,
    "alasan" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'menunggu',
    "pengajuId" TEXT,
    "penyetujuId" TEXT,
    "tanggalSetuju" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ExceptionLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nomorEXC" TEXT,
    "tipe" TEXT NOT NULL,
    "referensi" TEXT,
    "produkId" TEXT,
    "keterangan" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "resolvedBy" TEXT,
    "resolvedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ExceptionLog_produkId_fkey" FOREIGN KEY ("produkId") REFERENCES "Produk" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Waste" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nomorWaste" TEXT,
    "produkId" TEXT NOT NULL,
    "batchId" TEXT,
    "lokasiId" TEXT,
    "jumlah" REAL NOT NULL,
    "satuan" TEXT NOT NULL DEFAULT 'PCS',
    "alasan" TEXT NOT NULL,
    "referensi" TEXT,
    "petugasId" TEXT,
    "approval" TEXT NOT NULL DEFAULT 'auto',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Waste_produkId_fkey" FOREIGN KEY ("produkId") REFERENCES "Produk" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Waste_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Waste_lokasiId_fkey" FOREIGN KEY ("lokasiId") REFERENCES "Lokasi" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nomorTugas" TEXT NOT NULL,
    "jenis" TEXT NOT NULL,
    "referensiId" TEXT,
    "deskripsi" TEXT NOT NULL,
    "prioritas" TEXT NOT NULL DEFAULT 'NORMAL',
    "assignedTo" TEXT,
    "status" TEXT NOT NULL DEFAULT 'MENUNGGU',
    "deadline" DATETIME,
    "waktuMulai" DATETIME,
    "waktuSelesai" DATETIME,
    "catatan" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Task_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "judul" TEXT NOT NULL,
    "pesan" TEXT NOT NULL,
    "tipe" TEXT NOT NULL,
    "referensiId" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "aksi" TEXT NOT NULL,
    "modul" TEXT NOT NULL,
    "referensiId" TEXT,
    "nomorDokumen" TEXT,
    "detail" TEXT,
    "dataSebelum" TEXT,
    "dataSesudah" TEXT,
    "ipAddress" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_roleId_modul_key" ON "Permission"("roleId", "modul");

-- CreateIndex
CREATE UNIQUE INDEX "UserPermission_userId_modul_key" ON "UserPermission"("userId", "modul");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "SatuanBarang_kode_key" ON "SatuanBarang"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "KonversiSatuan_produkId_satuanBesarId_satuanKecilId_key" ON "KonversiSatuan"("produkId", "satuanBesarId", "satuanKecilId");

-- CreateIndex
CREATE UNIQUE INDEX "Produk_kodeProduk_key" ON "Produk"("kodeProduk");

-- CreateIndex
CREATE UNIQUE INDEX "Batch_nomorBatch_produkId_key" ON "Batch"("nomorBatch", "produkId");

-- CreateIndex
CREATE UNIQUE INDEX "Pemasok_kode_key" ON "Pemasok"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "Cabang_kode_key" ON "Cabang"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "Gudang_kode_key" ON "Gudang"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "Zona_gudangId_kode_key" ON "Zona"("gudangId", "kode");

-- CreateIndex
CREATE UNIQUE INDEX "Rak_zonaId_kode_key" ON "Rak"("zonaId", "kode");

-- CreateIndex
CREATE UNIQUE INDEX "Lokasi_rakId_kode_key" ON "Lokasi"("rakId", "kode");

-- CreateIndex
CREATE UNIQUE INDEX "PurchaseOrder_nomorPO_key" ON "PurchaseOrder"("nomorPO");

-- CreateIndex
CREATE UNIQUE INDEX "SalesOrder_nomorSO_key" ON "SalesOrder"("nomorSO");

-- CreateIndex
CREATE UNIQUE INDEX "PackingResult_soItemId_key" ON "PackingResult"("soItemId");

-- CreateIndex
CREATE UNIQUE INDEX "Shipment_nomorSJ_key" ON "Shipment"("nomorSJ");

-- CreateIndex
CREATE UNIQUE INDEX "Retur_nomorRetur_key" ON "Retur"("nomorRetur");

-- CreateIndex
CREATE UNIQUE INDEX "CycleCount_nomorCC_key" ON "CycleCount"("nomorCC");

-- CreateIndex
CREATE UNIQUE INDEX "StockAdjustment_nomorADJ_key" ON "StockAdjustment"("nomorADJ");

-- CreateIndex
CREATE UNIQUE INDEX "Task_nomorTugas_key" ON "Task"("nomorTugas");
