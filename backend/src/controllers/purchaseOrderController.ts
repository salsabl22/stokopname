import { Request, Response } from 'express';

// ============ PURCHASE ORDER ============
export const getPurchaseOrders = async (req: Request, res: Response) => {
  try {
    const data = await req.prisma.purchaseOrder.findMany({
      include: { pemasok: true, items: { include: { produk: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createPurchaseOrder = async (req: Request, res: Response) => {
  try {
    const { pemasokId, items } = req.body;
    const nomorPO = `PO-${Date.now()}`;
    const tanggal = new Date();

    const totalPesanan = items.reduce((sum: number, item: any) => {
      return sum + (Number(item.jumlahPesan) * Number(item.hargaSatuan));
    }, 0);

    const data = await req.prisma.purchaseOrder.create({
      data: {
        nomorPO,
        tanggal,
        pemasokId,
        totalPesanan,
        status: 'menunggu_pengiriman',
        items: {
          create: items.map((item: any) => ({
            produkId: item.produkId,
            satuan: item.satuan || 'PCS',
            jumlahPesan: Number(item.jumlah || item.jumlahPesan),
            hargaSatuan: Number(item.hargaSatuan),
          }))
        }
      },
      include: { pemasok: true, items: { include: { produk: true } } },
    });
    res.status(201).json(data);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updatePOStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, barangSesuai, jumlahSesuai, catatanSelisih, hasilQC, perluRepack, catatanQC, lokasiPenyimpanan, itemsReceived } = req.body;

    if (Array.isArray(itemsReceived)) {
      for (const item of itemsReceived) {
        await req.prisma.pOItem.update({
          where: { id: item.id },
          data: { jumlahDiterima: Number(item.jumlahDiterima) },
        });
      }
    }

    const data = await req.prisma.purchaseOrder.update({
      where: { id },
      data: {
        status,
        barangSesuai,
        jumlahSesuai,
        catatanSelisih,
        hasilQC,
        perluRepack,
        catatanQC,
        lokasiPenyimpanan,
      },
      include: { pemasok: true, items: { include: { produk: true } } },
    });

    // Jika status = disimpan, update inventory
    if (status === 'disimpan') {
      for (const item of data.items) {
        const existing = await req.prisma.inventory.findFirst({
          where: { produkId: item.produkId, lokasiId: null }
        });

        const jumlahMasuk = item.jumlahDiterima || item.jumlahPesan;

        if (existing) {
          await req.prisma.inventory.update({
            where: { id: existing.id },
            data: { jumlahTersedia: { increment: jumlahMasuk } }
          });
        } else {
          await req.prisma.inventory.create({
            data: {
              produkId: item.produkId,
              jumlahTersedia: jumlahMasuk,
              minimumStok: 0,
            }
          });
        }

        // Catat pergerakan stok
        await req.prisma.stockMovement.create({
          data: {
            produkId: item.produkId,
            tipe: 'MASUK',
            jumlah: jumlahMasuk,
            keterangan: `Penerimaan dari PO: ${data.nomorPO}`,
            referensi: data.id,
            nomorDokumen: data.nomorPO,
          }
        });
      }
    }

    res.json(data);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deletePurchaseOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await req.prisma.purchaseOrder.delete({ where: { id } });
    res.json({ message: 'Deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
