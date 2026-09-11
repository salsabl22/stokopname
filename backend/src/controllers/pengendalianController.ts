import { Request, Response } from 'express';
import { generateDocNumber } from '../utils/docNumberUtil';

// ============ CYCLE COUNT ============
export const getCycleCounts = async (req: Request, res: Response) => {
  try {
    const data = await req.prisma.cycleCount.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createCycleCount = async (req: Request, res: Response) => {
  try {
    const { gudangId, items, petugasId } = req.body;
    const tanggal = new Date();
    const nomorCC = await generateDocNumber(req.prisma, 'CC', 'CycleCount', 'nomorCC');

    const data = await req.prisma.cycleCount.create({
      data: {
        nomorCC,
        tanggal,
        gudangId,
        petugasId,
        status: 'draft',
        items: {
          create: items.map((item: any) => ({
            produkId: item.produkId,
            lokasiId: item.lokasiId,
            stokSistem: Number(item.stokSistem),
            stokFisik: 0,
            selisih: 0,
          }))
        }
      },
      include: { items: true },
    });
    res.status(201).json(data);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateCycleCountItem = async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;
    const { stokFisik, alasan } = req.body;
    const fisik = Number(stokFisik);

    const item = await req.prisma.cycleCountItem.findUnique({ where: { id: itemId } });
    if (!item) return res.status(404).json({ message: 'Item tidak ditemukan' });

    const selisih = fisik - item.stokSistem;
    const data = await req.prisma.cycleCountItem.update({
      where: { id: itemId },
      data: { stokFisik: fisik, selisih, alasan }
    });
    res.json(data);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// ============ STOCK ADJUSTMENT ============
export const getStockAdjustments = async (req: Request, res: Response) => {
  try {
    const data = await req.prisma.stockAdjustment.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createStockAdjustment = async (req: Request, res: Response) => {
  try {
    const { produkId, lokasiId, jumlahLama, jumlahBaru, alasan, pengajuId } = req.body;
    const selisih = Number(jumlahBaru) - Number(jumlahLama);
    const nomorADJ = await generateDocNumber(req.prisma, 'ADJ', 'StockAdjustment', 'nomorADJ');

    const data = await req.prisma.stockAdjustment.create({
      data: {
        nomorADJ,
        produkId,
        lokasiId,
        jumlahLama: Number(jumlahLama),
        jumlahBaru: Number(jumlahBaru),
        selisih,
        alasan,
        pengajuId,
        status: 'menunggu'
      }
    });

    if (pengajuId) {
      await req.prisma.activityLog.create({
        data: {
          userId: pengajuId,
          aksi: 'CREATE',
          modul: 'ADJUSTMENT',
          referensiId: data.id,
          nomorDokumen: data.nomorADJ,
          detail: `Pengajuan adjustment dari ${jumlahLama} menjadi ${jumlahBaru}`,
          dataSebelum: JSON.stringify({ jumlah: jumlahLama }),
          dataSesudah: JSON.stringify({ jumlah: jumlahBaru })
        }
      });
    }

    res.status(201).json(data);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const approveStockAdjustment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { approved, penyetujuId } = req.body;

    const adj = await req.prisma.stockAdjustment.findUnique({ where: { id } });
    if (!adj) return res.status(404).json({ message: 'Adjustment tidak ditemukan' });

    const status = approved ? 'disetujui' : 'ditolak';
    const data = await req.prisma.stockAdjustment.update({
      where: { id },
      data: {
        status,
        penyetujuId,
        tanggalSetuju: new Date()
      }
    });

    // Jika disetujui, update inventory
    if (approved) {
      const inv = await req.prisma.inventory.findFirst({ where: { produkId: adj.produkId } });
      if (inv) {
        await req.prisma.inventory.update({
          where: { id: inv.id },
          data: { jumlahTersedia: adj.jumlahBaru }
        });
      }
      await req.prisma.stockMovement.create({
        data: {
          nomorDokumen: adj.nomorADJ,
          produkId: adj.produkId,
          tipe: 'ADJUSTMENT',
          jumlah: Math.abs(adj.selisih),
          keterangan: `Stock Adjustment disetujui: ${adj.alasan}`,
        }
      });
    }

    if (penyetujuId) {
      await req.prisma.activityLog.create({
        data: {
          userId: penyetujuId,
          aksi: 'APPROVE',
          modul: 'ADJUSTMENT',
          referensiId: data.id,
          nomorDokumen: data.nomorADJ,
          detail: `Adjustment ${status}`,
          dataSebelum: JSON.stringify({ status: 'menunggu' }),
          dataSesudah: JSON.stringify({ status })
        }
      });
    }

    res.json(data);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// ============ EXCEPTION LOG ============
export const getExceptions = async (req: Request, res: Response) => {
  try {
    const data = await req.prisma.exceptionLog.findMany({
      include: { produk: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createException = async (req: Request, res: Response) => {
  try {
    const { tipe, referensi, produkId, keterangan } = req.body;
    const nomorEXC = await generateDocNumber(req.prisma, 'EXC', 'ExceptionLog', 'nomorEXC');

    const data = await req.prisma.exceptionLog.create({
      data: {
        nomorEXC,
        tipe,
        referensi,
        produkId: produkId || null,
        keterangan,
        status: 'pending'
      },
      include: { produk: true },
    });
    res.status(201).json(data);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const resolveException = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { resolvedBy } = req.body;

    const data = await req.prisma.exceptionLog.update({
      where: { id },
      data: {
        status: 'resolved',
        resolvedBy,
        resolvedAt: new Date()
      },
    });
    res.json(data);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// ============ WASTE ============
export const getWaste = async (req: Request, res: Response) => {
  try {
    const data = await req.prisma.waste.findMany({
      include: { produk: true, batch: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createWaste = async (req: Request, res: Response) => {
  try {
    const { produkId, batchId, lokasiId, petugasId, jumlah, satuan, alasan, referensi } = req.body;
    const nomorWaste = await generateDocNumber(req.prisma, 'WST', 'Waste', 'nomorWaste');

    const data = await req.prisma.$transaction(async (tx: any) => {
      const waste = await tx.waste.create({
        data: {
          nomorWaste,
          produkId,
          batchId: batchId || null,
          lokasiId: lokasiId || null,
          petugasId: petugasId || null,
          jumlah: Number(jumlah),
          satuan: satuan || 'PCS',
          alasan,
          referensi: referensi || null,
          approval: 'auto'
        },
        include: { produk: true },
      });

      // Kurangi inventory
      const invWhere: any = { produkId };
      if (batchId) invWhere.batchId = batchId;
      if (lokasiId) invWhere.lokasiId = lokasiId;

      const inv = await tx.inventory.findFirst({ where: invWhere });

      if (inv) {
        await tx.inventory.update({
          where: { id: inv.id },
          data: {
            jumlahTersedia: { decrement: Number(jumlah) },
            jumlahWaste: { increment: Number(jumlah) },
          }
        });
      }

      // Catat stock movement
      await tx.stockMovement.create({
        data: {
          nomorDokumen: nomorWaste,
          produkId,
          batchId: batchId || null,
          tipe: 'WASTE',
          jumlah: Number(jumlah),
          keterangan: `Waste: ${alasan}`,
          referensi: referensi || null,
          userId: petugasId || null
        }
      });

      if (petugasId) {
        await tx.activityLog.create({
          data: {
            userId: petugasId,
            aksi: 'CREATE',
            modul: 'WASTE',
            referensiId: waste.id,
            nomorDokumen: waste.nomorWaste,
            detail: `Mencatat waste ${jumlah} ${satuan}`,
          }
        });
      }

      return waste;
    });

    res.status(201).json(data);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
