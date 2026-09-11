-- DropForeignKey
ALTER TABLE `Retur` DROP FOREIGN KEY `Retur_cabangId_fkey`;

-- AlterTable
ALTER TABLE `Retur` ADD COLUMN `poId` VARCHAR(191) NULL,
    MODIFY `cabangId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Retur` ADD CONSTRAINT `Retur_cabangId_fkey` FOREIGN KEY (`cabangId`) REFERENCES `Cabang`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

