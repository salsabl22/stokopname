import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'wms-super-secret-key-2026';

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Unauthorized. Token tidak ditemukan.' });
      return;
    }

    // MEMAKAI INDEKS [1]: Mengambil string token, bukan array string[]
    const token = authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({ message: 'Unauthorized. Token tidak ditemukan.' });
      return;
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      res.status(401).json({ message: 'Sesi telah berakhir atau token tidak valid. Silakan login kembali.' });
      return;
    }

    // Keamanan tambahan: pastikan token memang dibuat untuk unit bisnis yang sedang diakses
    if (decoded.unitBisnis && (req as any).unitBisnis && decoded.unitBisnis !== (req as any).unitBisnis) {
      res.status(401).json({ message: 'Token tidak berlaku untuk unit bisnis ini. Silakan login ulang.' });
      return;
    }

    const userId = decoded.userId;
    if (!userId || typeof userId !== 'string') {
      res.status(401).json({ message: 'Token tidak valid. User ID tidak ditemukan.' });
      return;
    }

    const user = await (req as any).prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: { permissions: true }
        },
        userPermissions: true
      }
    });

    if (!user || !user.isActive) {
      res.status(401).json({ message: 'User tidak valid atau tidak aktif.' });
      return;
    }

    (req as any).user = user;
    next();
  } catch (error: any) {
    res.status(500).json({ message: 'Terjadi kesalahan pada server saat verifikasi auth.' });
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const roleName = user.role?.name;
    if (!roleName || !allowedRoles.includes(roleName)) {
      res.status(403).json({ message: 'Forbidden. Hak akses ditolak.' });
      return;
    }

    next();
  };
};

export const requirePermission = (modul: string, aksi: 'lihat' | 'buat' | 'ubah' | 'hapus' | 'proses' | 'setujui' | 'export') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Role dengan akses penuh (harus SAMA PERSIS dengan nama role di prisma/seed.ts)
    if (user.role?.name === 'SUPER ADMIN') {
      next();
      return;
    }

    const rolePerms = user.role?.permissions || [];
    const userPerms = user.userPermissions || [];

    // Merge logic
    const merged: Record<string, any> = {};
    for (const p of rolePerms) {
      merged[p.modul] = { ...p };
    }
    for (const p of userPerms) {
      if (merged[p.modul]) {
        merged[p.modul] = {
          ...merged[p.modul],
          lihat: merged[p.modul].lihat || p.lihat,
          buat: merged[p.modul].buat || p.buat,
          ubah: merged[p.modul].ubah || p.ubah,
          hapus: merged[p.modul].hapus || p.hapus,
          proses: merged[p.modul].proses || p.proses,
          setujui: merged[p.modul].setujui || p.setujui,
          export: merged[p.modul].export || p.export,
        };
      } else {
        merged[p.modul] = { ...p };
      }
    }
    const permissions = Object.values(merged);

    // Cari permission spesifik modul atau wildcard 'semua'
    const perm = permissions.find((p: any) => p.modul === modul || p.modul === 'semua');

    if (!perm || !perm[aksi]) {
      res.status(403).json({ message: `Forbidden. Anda tidak memiliki akses '${aksi}' untuk modul '${modul}'.` });
      return;
    }

    next();
  };
};
