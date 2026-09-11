import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Pastikan direktori upload ada
const ensureDir = (dir: string) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

// Storage config untuk foto retur
const returStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join(process.cwd(), 'uploads', 'retur');
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ts = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `retur_${ts}${ext}`);
  },
});

// Storage config untuk foto pengembalian pemasok
const pengembalianStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join(process.cwd(), 'uploads', 'pengembalian');
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ts = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `pengembalian_${ts}${ext}`);
  },
});

const imageFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Hanya file gambar yang diizinkan.'));
  }
};

const uploadRetur = multer({ storage: returStorage, fileFilter: imageFilter, limits: { fileSize: 10 * 1024 * 1024 } });
const uploadPengembalian = multer({ storage: pengembalianStorage, fileFilter: imageFilter, limits: { fileSize: 10 * 1024 * 1024 } });

// POST /api/upload/foto-retur/:returId
router.post('/foto-retur/:returId', uploadRetur.single('foto'), async (req: Request, res: Response) => {
  try {
    const { returId } = req.params;
    const { keterangan, timestamp } = req.body;
    const userId = (req as any).user?.id;

    if (!req.file) return res.status(400).json({ message: 'File foto tidak ditemukan.' });

    const filePath = `uploads/retur/${req.file.filename}`;
    const foto = await req.prisma.fotoRetur.create({
      data: {
        returId,
        filePath,
        fileName: req.file.originalname,
        mimeType: req.file.mimetype,
        ukuranBytes: req.file.size,
        keterangan: keterangan || null,
        timestamp: timestamp ? new Date(timestamp) : new Date(),
        uploadedBy: userId || null,
      },
    });

    res.status(201).json({ ...foto, url: `http://localhost:${process.env.PORT || 3000}/${filePath}` });
  } catch (e: any) {
    console.error('[UPLOAD] foto-retur error:', e);
    res.status(500).json({ message: e.message });
  }
});

// POST /api/upload/foto-pengembalian/:exceptionLogId
router.post('/foto-pengembalian/:exceptionLogId', uploadPengembalian.single('foto'), async (req: Request, res: Response) => {
  try {
    const { exceptionLogId } = req.params;
    const { keterangan, timestamp } = req.body;
    const userId = (req as any).user?.id;

    if (!req.file) return res.status(400).json({ message: 'File foto tidak ditemukan.' });

    const filePath = `uploads/pengembalian/${req.file.filename}`;
    const foto = await req.prisma.fotoPengembalianPemasok.create({
      data: {
        exceptionLogId,
        filePath,
        fileName: req.file.originalname,
        mimeType: req.file.mimetype,
        ukuranBytes: req.file.size,
        keterangan: keterangan || null,
        timestamp: timestamp ? new Date(timestamp) : new Date(),
        uploadedBy: userId || null,
      },
    });

    res.status(201).json({ ...foto, url: `http://localhost:${process.env.PORT || 3000}/${filePath}` });
  } catch (e: any) {
    console.error('[UPLOAD] foto-pengembalian error:', e);
    res.status(500).json({ message: e.message });
  }
});

// GET /api/upload/foto-retur/:returId - list foto untuk retur tertentu
router.get('/foto-retur/:returId', async (req: Request, res: Response) => {
  try {
    const fotos = await req.prisma.fotoRetur.findMany({
      where: { returId: req.params.returId },
      orderBy: { createdAt: 'asc' },
    });
    res.json(fotos.map((f: any) => ({
      ...f,
      url: `http://localhost:${process.env.PORT || 3000}/${f.filePath}`,
    })));
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

// DELETE /api/upload/foto-retur/item/:fotoId
router.delete('/foto-retur/item/:fotoId', async (req: Request, res: Response) => {
  try {
    const foto = await req.prisma.fotoRetur.findUnique({ where: { id: req.params.fotoId } });
    if (!foto) return res.status(404).json({ message: 'Foto tidak ditemukan.' });

    // Hapus file fisik
    const fullPath = path.join(process.cwd(), foto.filePath);
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);

    await req.prisma.fotoRetur.delete({ where: { id: foto.id } });
    res.json({ message: 'Foto dihapus.' });
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

export default router;
