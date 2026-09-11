import { Request, Response } from 'express';

// ============ PRODUK ============
export const getProduk = async (req: Request, res: Response) => {
  try {
    const { unitBisnis, kategori, status, search } = req.query;

    const where: any = {};
    if (unitBisnis) where.unitBisnis = unitBisnis;
    if (kategori) where.kategori = String(kategori);
    if (status) where.status = String(status);
    if (search) {
      where.OR = [
        { namaProduk: { contains: String(search) } },
        { kodeProduk: { contains: String(search) } },
        { kategori: { contains: String(search) } },
      ];
    }

    const data = await req.prisma.produk.findMany({
      where,
      include: { satuan: true, satuanPembelian: true, konversiSatuan: true },
      orderBy: [{ unitBisnis: 'asc' }, { kodeProduk: 'asc' }],
    });
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getProdukById = async (req: Request, res: Response) => {
  try {
    const data = await req.prisma.produk.findUnique({
      where: { id: req.params.id },
      include: { satuan: true, satuanPembelian: true, konversiSatuan: { include: { satuanBesar: true, satuanKecil: true } } },
    });
    if (!data) return res.status(404).json({ message: 'Produk tidak ditemukan.' });
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createProduk = async (req: Request, res: Response) => {
  try {
    const { kodeProduk, namaProduk, kategori, unitBisnis, satuanId, satuanPembelianId, konversi, minimumStok, status, deskripsi, hargaBeli } = req.body;

    const data = await req.prisma.$transaction(async (tx: any) => {
      const produk = await tx.produk.create({
        data: {
          kodeProduk: kodeProduk.toUpperCase(),
          namaProduk,
          kategori,
          unitBisnis: unitBisnis || 'FOTOSNAPS',
          satuanId: satuanId || null,
          satuanPembelianId: satuanPembelianId || null,
          konversi: Number(konversi) || 1,
          minimumStok: Number(minimumStok) || 0,
          status: status || 'aktif',
          deskripsi: deskripsi || null,
          hargaBeli: hargaBeli ? Number(hargaBeli) : null,
        },
        include: { satuan: true, satuanPembelian: true },
      });

      if (satuanId && satuanPembelianId && satuanId !== satuanPembelianId && Number(konversi) > 1) {
        await tx.konversiSatuan.create({
          data: {
            produkId: produk.id,
            satuanBesarId: satuanPembelianId,
            satuanKecilId: satuanId,
            nilaiKonversi: Number(konversi),
          },
        });
      }

      return produk;
    });

    res.status(201).json(data);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateProduk = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { kodeProduk, namaProduk, kategori, unitBisnis, satuanId, satuanPembelianId, konversi, minimumStok, status, deskripsi, hargaBeli } = req.body;

    const data = await req.prisma.$transaction(async (tx: any) => {
      const produk = await tx.produk.update({
        where: { id },
        data: {
          kodeProduk: kodeProduk.toUpperCase(),
          namaProduk,
          kategori,
          unitBisnis: unitBisnis || 'FOTOSNAPS',
          satuanId: satuanId || null,
          satuanPembelianId: satuanPembelianId || null,
          konversi: Number(konversi) || 1,
          minimumStok: Number(minimumStok) || 0,
          status: status || 'aktif',
          deskripsi: deskripsi || null,
          hargaBeli: hargaBeli ? Number(hargaBeli) : null,
        },
        include: { satuan: true, satuanPembelian: true, konversiSatuan: true },
      });

      if (satuanId && satuanPembelianId && satuanId !== satuanPembelianId && Number(konversi) > 1) {
        await tx.konversiSatuan.upsert({
          where: {
            produkId_satuanBesarId_satuanKecilId: {
              produkId: produk.id,
              satuanBesarId: satuanPembelianId,
              satuanKecilId: satuanId,
            },
          },
          update: { nilaiKonversi: Number(konversi) },
          create: {
            produkId: produk.id,
            satuanBesarId: satuanPembelianId,
            satuanKecilId: satuanId,
            nilaiKonversi: Number(konversi),
          },
        });
      }

      return produk;
    });

    res.json(data);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteProduk = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await req.prisma.produk.delete({ where: { id } });
    res.json({ message: 'Deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
