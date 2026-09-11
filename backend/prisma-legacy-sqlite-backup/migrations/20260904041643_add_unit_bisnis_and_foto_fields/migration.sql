-- AlterTable
ALTER TABLE "ExceptionLog" ADD COLUMN "alasanPengembalian" TEXT;
ALTER TABLE "ExceptionLog" ADD COLUMN "pemasokId" TEXT;

-- CreateTable
CREATE TABLE "FotoRetur" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "returId" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL DEFAULT 'image/jpeg',
    "ukuranBytes" INTEGER,
    "keterangan" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploadedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FotoRetur_returId_fkey" FOREIGN KEY ("returId") REFERENCES "Retur" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FotoPengembalianPemasok" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "exceptionLogId" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL DEFAULT 'image/jpeg',
    "ukuranBytes" INTEGER,
    "keterangan" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploadedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FotoPengembalianPemasok_exceptionLogId_fkey" FOREIGN KEY ("exceptionLogId") REFERENCES "ExceptionLog" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Produk" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "kodeProduk" TEXT NOT NULL,
    "namaProduk" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "unitBisnis" TEXT NOT NULL DEFAULT 'FOTOSNAPS',
    "satuanId" TEXT,
    "satuanPembelianId" TEXT,
    "konversi" REAL NOT NULL DEFAULT 1,
    "minimumStok" REAL NOT NULL DEFAULT 0,
    "trackBatch" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'aktif',
    "deskripsi" TEXT,
    "hargaBeli" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Produk_satuanId_fkey" FOREIGN KEY ("satuanId") REFERENCES "SatuanBarang" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Produk_satuanPembelianId_fkey" FOREIGN KEY ("satuanPembelianId") REFERENCES "SatuanBarang" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Produk" ("createdAt", "id", "kategori", "kodeProduk", "konversi", "minimumStok", "namaProduk", "satuanId", "satuanPembelianId", "status", "trackBatch", "updatedAt") SELECT "createdAt", "id", "kategori", "kodeProduk", "konversi", "minimumStok", "namaProduk", "satuanId", "satuanPembelianId", "status", "trackBatch", "updatedAt" FROM "Produk";
DROP TABLE "Produk";
ALTER TABLE "new_Produk" RENAME TO "Produk";
CREATE UNIQUE INDEX "Produk_kodeProduk_key" ON "Produk"("kodeProduk");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
