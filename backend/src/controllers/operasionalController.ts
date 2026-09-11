import { Request, Response } from 'express';
import { generateDocNumber } from '../utils/docNumberUtil';

// ============ INVENTORY ============
export const getInventory = async (req: Request, res: Response) => {
  try {
    const data = await req.prisma.inventory.findMany({
      include: {
        produk: true,
        batch: true,
        lokasi: { include: { rak: { include: { gudang: true } } } }
      },
    });
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// ============ SALES ORDER (Pesanan Cabang) ============
export const getSalesOrders = async (req: Request, res: Response) => {
  try {
    const data = await req.prisma.salesOrder.findMany({
      include: { cabang: true, items: { include: { produk: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createSalesOrder = async (req: Request, res: Response) => {
  try {
    const { cabangId, items, catatan, prioritas, deadline } = req.body;
    const nomorSO = await generateDocNumber(req.prisma, 'SO', 'SalesOrder', 'nomorSO');

    const data = await req.prisma.salesOrder.create({
      data: {
        nomorSO,
        cabangId,
        catatan,
        prioritas: prioritas || 'NORMAL',
        deadline: deadline ? new Date(deadline) : null,
        status: 'menunggu_alokasi',
        items: {
          create: items.map((item: any) => ({
            produkId: item.produkId,
            satuan: item.satuan || 'PCS',
            jumlahPesan: Number(item.jumlah || item.jumlahPesan),
          }))
        }
      },
      include: { cabang: true, items: { include: { produk: true } } },
    });
    res.status(201).json(data);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateSOStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const so = await req.prisma.salesOrder.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!so) return res.status(404).json({ message: 'SO tidak ditemukan' });

    let updateData: any = { status };

    // Jika status = dialokasikan, implementasikan FEFO untuk mengurangi stok yang available
    if (status === 'dialokasikan') {
      for (const item of so.items) {
        // Cari inventory berdasarkan produk, urutkan batch expired terdekat (FEFO)
        const inventories = await req.prisma.inventory.findMany({
          where: {
            produkId: item.produkId,
            jumlahTersedia: { gt: 0 }
          },
          include: { batch: true },
          orderBy: {
            batch: {
              tanggalKedaluwarsa: 'asc'
            }
          }
        });

        let remainingToAllocate = item.jumlahPesan;

        for (const inv of inventories) {
          if (remainingToAllocate <= 0) break;

          const toAllocate = Math.min(inv.jumlahTersedia, remainingToAllocate);

          await req.prisma.inventory.update({
            where: { id: inv.id },
            data: {
              jumlahTersedia: { decrement: toAllocate },
              jumlahDialokasikan: { increment: toAllocate },
            }
          });

          remainingToAllocate -= toAllocate;
        }

        // Simpan jumlah alokasi di item SO
        await req.prisma.sOItem.update({
          where: { id: item.id },
          data: { jumlahAlokasi: item.jumlahPesan - remainingToAllocate }
        });
      }
    }

    // Jika dikirim, kurangi reserved, catat stockmovement dan buat Shipment
    if (status === 'dikirim') {
      const nomorSJ = await generateDocNumber(req.prisma, 'SHP', 'Shipment', 'nomorSJ');

      await req.prisma.shipment.create({
        data: {
          nomorSJ,
          soId: so.id,
          tanggalPengiriman: new Date(),
          status: 'dalam_perjalanan'
        }
      });

      for (const item of so.items) {
        // Ambil inventory yang dialokasikan
        const inventories = await req.prisma.inventory.findMany({
          where: {
            produkId: item.produkId,
            jumlahDialokasikan: { gt: 0 }
          }
        });

        let remainingToDeduct = item.jumlahPesan;
        for (const inv of inventories) {
          if (remainingToDeduct <= 0) break;
          const toDeduct = Math.min(inv.jumlahDialokasikan, remainingToDeduct);

          await req.prisma.inventory.update({
            where: { id: inv.id },
            data: { jumlahDialokasikan: { decrement: toDeduct } }
          });

          await req.prisma.stockMovement.create({
            data: {
              nomorDokumen: nomorSJ,
              produkId: item.produkId,
              batchId: inv.batchId,
              tipe: 'KELUAR',
              jumlah: toDeduct,
              keterangan: `Pengiriman dari SO: ${so.nomorSO}`,
              referensi: so.id,
            }
          });

          remainingToDeduct -= toDeduct;
        }
      }
    }

    const data = await req.prisma.salesOrder.update({
      where: { id },
      data: updateData,
      include: { cabang: true, items: { include: { produk: true } } },
    });

    res.json(data);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const savePackingResult = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // ID dari SO
    const { packingResults, petugasId } = req.body;

    const data = await req.prisma.$transaction(async (tx: any) => {
      const results = [];
      const nomorPacking = await generateDocNumber(req.prisma, 'PCK', 'PackingResult', 'nomorPacking');

      for (const result of packingResults) {
        const soItem = await tx.sOItem.findUnique({ where: { id: result.soItemId } });
        if (!soItem) continue;

        const pResult = await tx.packingResult.upsert({
          where: { soItemId: result.soItemId },
          update: {
            satuanKemasan: result.satuanKemasan,
            jumlahKemasan: Number(result.jumlahKemasan),
            sisaJumlah: Number(result.sisaJumlah),
            petugasId,
            waktuSelesai: new Date(),
          },
          create: {
            soItemId: result.soItemId,
            produkId: soItem.produkId,
            nomorPacking,
            jumlahAwal: soItem.jumlahPick > 0 ? soItem.jumlahPick : soItem.jumlahAlokasi,
            satuanKemasan: result.satuanKemasan,
            jumlahKemasan: Number(result.jumlahKemasan),
            sisaJumlah: Number(result.sisaJumlah),
            petugasId,
            waktuMulai: new Date(),
            waktuSelesai: new Date(),
          }
        });
        results.push(pResult);
      }

      // Update SO
      await tx.salesOrder.update({
        where: { id },
        data: {
          status: 'siap_kirim',
          nomorPacking
        }
      });

      return results;
    });

    res.status(201).json(data);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// ============ RETUR ============
export const getReturns = async (req: Request, res: Response) => {
  try {
    const data = await req.prisma.retur.findMany({
      include: { cabang: true, so: true, items: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createReturn = async (req: Request, res: Response) => {
  try {
    const { soId, cabangId, alasan, items } = req.body;
    const nomorRetur = await generateDocNumber(req.prisma, 'RTR', 'Retur', 'nomorRetur');

    const data = await req.prisma.retur.create({
      data: {
        nomorRetur,
        soId,
        cabangId,
        alasan,
        status: 'diajukan',
        items: {
          create: items.map((item: any) => ({
            produkId: item.produkId,
            satuan: item.satuan || 'PCS',
            jumlah: Number(item.jumlah),
            batchId: item.batchId || null,
          }))
        }
      },
      include: { cabang: true, items: true },
    });
    res.status(201).json(data);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateReturStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, kondisi, catatan } = req.body;

    let updateData: any = { status, kondisi, catatan };

    // Set tanggal sesuai status
    if (status === 'diterima') updateData.tanggalPenerimaan = new Date();
    else if (status === 'diperiksa') updateData.tanggalPemeriksaan = new Date();
    else if (status === 'kembali_ke_stok' || status === 'waste') updateData.tanggalKeputusan = new Date();

    const data = await req.prisma.retur.update({
      where: { id },
      data: updateData,
      include: { cabang: true, items: true },
    });

    // Jika kondisi good dan status kembali ke stok, update inventory
    if (status === 'kembali_ke_stok') {
      for (const item of data.items) {
        // Cari inventory slot berdasarkan produkId & batchId
        let inv = await req.prisma.inventory.findFirst({
          where: { produkId: item.produkId, batchId: item.batchId }
        });

        if (inv) {
          await req.prisma.inventory.update({
            where: { id: inv.id },
            data: { jumlahTersedia: { increment: item.jumlah } }
          });
        } else {
          // Buat record inventory baru
          await req.prisma.inventory.create({
            data: {
              produkId: item.produkId,
              batchId: item.batchId,
              jumlahTersedia: item.jumlah
            }
          });
        }

        await req.prisma.stockMovement.create({
          data: {
            nomorDokumen: data.nomorRetur,
            produkId: item.produkId,
            batchId: item.batchId,
            tipe: 'RETUR',
            jumlah: item.jumlah,
            keterangan: `Retur dikembalikan ke stok: ${data.nomorRetur}`,
            referensi: data.id,
          }
        });
      }
    }

    res.json(data);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// ============ STOCK MOVEMENT ============
export const getStockMovements = async (req: Request, res: Response) => {
  try {
    const data = await req.prisma.stockMovement.findMany({
      include: { produk: true },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
