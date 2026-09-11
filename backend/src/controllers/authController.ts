import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'wms-super-secret-key-2026';

/** Merge role permissions + user-level override permissions */
function mergePermissions(rolePerms: any[], userPerms: any[]): any[] {
  const merged: Record<string, any> = {};

  // Seed role permissions first
  for (const p of rolePerms) {
    merged[p.modul] = { ...p };
  }

  // User-level override: kalau admin sudah set akses khusus untuk modul ini,
  // nilai tsb yang final untuk user ini — bisa menambah ATAU mencabut akses
  // dari peran (bukan cuma OR-additive, supaya admin benar-benar bisa
  // mengendalikan akses per user).
  for (const p of userPerms) {
    merged[p.modul] = { ...p };
  }

  return Object.values(merged);
}

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username dan password wajib diisi.' });
    }

    const user = await req.prisma.user.findUnique({
      where: { username },
      include: {
        role: {
          include: { permissions: true },
        },
        userPermissions: true,
      },
    });

    if (!user) {
      return res.status(401).json({ message: 'Username atau password salah.' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Username atau password salah.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Akun dinonaktifkan. Silakan hubungi administrator.' });
    }

    const roleName = user.role?.name || 'USER';
    const rolePerms = user.role?.permissions || [];
    const userPerms = user.userPermissions || [];
    const effectivePermissions = mergePermissions(rolePerms, userPerms);

    // Generate JWT Token (24 jam)
    const token = jwt.sign(
      { userId: user.id, username: user.username, role: roleName, unitBisnis: req.unitBisnis },
      JWT_SECRET,
      { expiresIn: '24h' },
    );

    res.json({
      message: 'Login berhasil',
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: roleName,
        roleId: user.roleId,
        isActive: user.isActive,
        permissions: effectivePermissions,
        // Raw permissions untuk keperluan admin UI
        rolePermissions: rolePerms,
        userPermissions: userPerms,
      },
      unitBisnis: req.unitBisnis,
    });
  } catch (error: any) {
    console.error('[AUTH] Login error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { username, name, password } = req.body;

    if (!username || !name || !password) {
      return res.status(400).json({ message: 'Username, nama, dan password wajib diisi.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password minimal 6 karakter.' });
    }

    // Cek duplikat username
    const existing = await req.prisma.user.findUnique({ where: { username } });
    if (existing) {
      return res.status(409).json({ message: 'Username sudah digunakan. Pilih username lain.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // User baru dibuat dengan isActive: false — menunggu persetujuan admin
    const user = await req.prisma.user.create({
      data: {
        username,
        name,
        password: hashedPassword,
        isActive: false,
        roleId: null,
      },
    });

    res.status(201).json({
      message: 'Pendaftaran berhasil! Akun Anda sedang menunggu persetujuan dari admin.',
      userId: user.id,
    });
  } catch (error: any) {
    console.error('[AUTH] Register error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await req.prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: { permissions: true },
        },
        userPermissions: true,
      },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'User tidak valid atau dinonaktifkan.' });
    }

    const roleName = user.role?.name || 'USER';
    const rolePerms = user.role?.permissions || [];
    const userPerms = user.userPermissions || [];
    const effectivePermissions = mergePermissions(rolePerms, userPerms);

    res.json({
      id: user.id,
      username: user.username,
      name: user.name,
      role: roleName,
      roleId: user.roleId,
      isActive: user.isActive,
      permissions: effectivePermissions,
      rolePermissions: rolePerms,
      userPermissions: userPerms,
    });
  } catch (error: any) {
    console.error('[AUTH] getMe error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};
