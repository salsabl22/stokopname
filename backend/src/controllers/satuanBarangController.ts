import { Request, Response } from 'express';

export const getSatuanBarang = async (req: Request, res: Response) => {
  try {
    const data = await req.prisma.satuanBarang.findMany({
      orderBy: { nama: 'asc' }
    });
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createSatuanBarang = async (req: Request, res: Response) => {
  try {
    const { kode, nama, deskripsi, isActive } = req.body;
    const data = await req.prisma.satuanBarang.create({
      data: { kode, nama, deskripsi, isActive }
    });
    res.status(201).json(data);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateSatuanBarang = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { kode, nama, deskripsi, isActive } = req.body;
    const data = await req.prisma.satuanBarang.update({
      where: { id },
      data: { kode, nama, deskripsi, isActive }
    });
    res.json(data);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteSatuanBarang = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await req.prisma.satuanBarang.delete({ where: { id } });
    res.json({ message: 'Deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
