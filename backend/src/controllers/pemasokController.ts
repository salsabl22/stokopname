import { Request, Response } from 'express';

export const getPemasok = async (req: Request, res: Response) => {
  try {
    const data = await req.prisma.pemasok.findMany({ orderBy: { kode: 'asc' } });
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createPemasok = async (req: Request, res: Response) => {
  try {
    const { kode, nama, kontak, telepon, email, alamat, status } = req.body;
    const data = await req.prisma.pemasok.create({
      data: { kode: kode.toUpperCase(), nama, kontak, telepon, email, alamat, status }
    });
    res.status(201).json(data);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updatePemasok = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { kode, nama, kontak, telepon, email, alamat, status } = req.body;
    const data = await req.prisma.pemasok.update({
      where: { id },
      data: { kode: kode.toUpperCase(), nama, kontak, telepon, email, alamat, status }
    });
    res.json(data);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deletePemasok = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await req.prisma.pemasok.delete({ where: { id } });
    res.json({ message: 'Deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
