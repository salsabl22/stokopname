import { Request, Response } from 'express';

export const getCabang = async (req: Request, res: Response) => {
  try {
    const data = await req.prisma.cabang.findMany({ orderBy: { kode: 'asc' } });
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createCabang = async (req: Request, res: Response) => {
  try {
    const { kode, nama, tipe, telepon, alamat, status } = req.body;
    const data = await req.prisma.cabang.create({
      data: { kode: kode.toUpperCase(), nama, tipe, telepon, alamat, status }
    });
    res.status(201).json(data);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateCabang = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { kode, nama, tipe, telepon, alamat, status } = req.body;
    const data = await req.prisma.cabang.update({
      where: { id },
      data: { kode: kode.toUpperCase(), nama, tipe, telepon, alamat, status }
    });
    res.json(data);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteCabang = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await req.prisma.cabang.delete({ where: { id } });
    res.json({ message: 'Deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
