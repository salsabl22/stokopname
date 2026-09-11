-- DropForeignKey
ALTER TABLE `Rak` DROP FOREIGN KEY `Rak_zonaId_fkey`;

-- DropForeignKey
ALTER TABLE `Zona` DROP FOREIGN KEY `Zona_gudangId_fkey`;

-- DropIndex
DROP INDEX `Rak_zonaId_kode_key` ON `Rak`;

-- AlterTable
ALTER TABLE `Rak` DROP COLUMN `zonaId`,
    ADD COLUMN `gudangId` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `Zona`;

-- CreateIndex
CREATE UNIQUE INDEX `Rak_gudangId_kode_key` ON `Rak`(`gudangId`, `kode`);

-- AddForeignKey
ALTER TABLE `Rak` ADD CONSTRAINT `Rak_gudangId_fkey` FOREIGN KEY (`gudangId`) REFERENCES `Gudang`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

