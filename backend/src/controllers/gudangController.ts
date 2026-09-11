import { Request, Response } from 'express';

// ---- GUDANG ----
export const getGudang = async (req: Request, res: Response) => {
  try {
    const data = await req.prisma.gudang.findMany({
      include: {
        raks: {
          include: { lokasis: true }
        }
      },
      orderBy: { kode: 'asc' }
    });
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createGudang = async (req: Request, res: Response) => {
  try {
    const { kode, nama, alamat, status } = req.body;
    const data = await req.prisma.gudang.create({ data: { kode: kode.toUpperCase(), nama, alamat, status } });
    res.status(201).json(data);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteGudang = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // cascade delete karena sudah dikonfigurasi di schema
    await req.prisma.gudang.delete({ where: { id } });
    res.json({ message: 'Deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// ---- RAK ----
export const createRak = async (req: Request, res: Response) => {
  try {
    const { kode, gudangId } = req.body;
    const data = await req.prisma.rak.create({ data: { kode: kode.toUpperCase(), gudangId } });
    res.status(201).json(data);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteRak = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await req.prisma.rak.delete({ where: { id } });
    res.json({ message: 'Deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// ---- LOKASI ----
export const createLokasi = async (req: Request, res: Response) => {
  try {
    const { kode, tipe, rakId } = req.body;
    const data = await req.prisma.lokasi.create({ data: { kode: kode.toUpperCase(), tipe, rakId } });
    res.status(201).json(data);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteLokasi = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await req.prisma.lokasi.delete({ where: { id } });
    res.json({ message: 'Deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllFlatLocations = async (req: Request, res: Response) => {
  try {
    const lokasis = await req.prisma.lokasi.findMany({
      include: {
        rak: {
          include: { gudang: true }
        }
      }
    });
    const result = lokasis.map((l: any) => ({
      id: l.id,
      fullPath: [l.rak.gudang.nama, l.rak.kode, l.kode].join(' / '),
      kodeLokasi: l.kode,
    }));
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
