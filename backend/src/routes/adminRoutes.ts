import { Router } from 'express';
import bcrypt from 'bcryptjs';

const router = Router();

// GET semua users (untuk Admin)
router.get('/users', async (req, res) => {
  try {
    const data = await req.prisma.user.findMany({
      include: {
        role: { include: { permissions: true } },
        userPermissions: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(data.map((u: any) => ({ ...u, password: undefined })));
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

// CREATE user
router.post('/users', async (req, res) => {
  try {
    const { username, name, password, roleId } = req.body;
    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;
    
    if (!hashedPassword) {
      return res.status(400).json({ message: "Password is required" });
    }

    const data = await req.prisma.user.create({
      data: { username, name, password: hashedPassword, roleId: roleId || null },
      include: { role: true },
    });
    res.status(201).json({ ...data, password: undefined });
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});

// UPDATE user
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { username, name, password, roleId, isActive } = req.body;
    const updateData: any = { username, name, roleId: roleId || null, isActive };
    
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    
    const data = await req.prisma.user.update({
      where: { id },
      data: updateData,
      include: { role: true },
    });
    res.json({ ...data, password: undefined });
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});

// DELETE user
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await req.prisma.user.delete({ where: { id } });
    res.json({ message: 'Deleted' });
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});

// PATCH: aktifkan / nonaktifkan user (termasuk approve pendaftaran baru)
router.patch('/users/:id/activate', async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive, roleId } = req.body;
    const updateData: any = { isActive };
    if (roleId !== undefined) updateData.roleId = roleId || null;
    const data = await req.prisma.user.update({
      where: { id },
      data: updateData,
      include: { role: true },
    });
    res.json({ ...data, password: undefined });
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});

// GET semua roles dengan permissions
router.get('/roles', async (req, res) => {
  try {
    const data = await req.prisma.role.findMany({
      include: { permissions: true },
    });
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

// UPDATE permission untuk role + modul tertentu
router.put('/roles/:roleId/permissions', async (req, res) => {
  try {
    const { roleId } = req.params;
    const { modul, lihat, buat, ubah, hapus, proses, setujui, export: exp } = req.body;
    const data = await req.prisma.permission.upsert({
      where: { roleId_modul: { roleId, modul } },
      update: { lihat, buat, ubah, hapus, proses, setujui, export: exp },
      create: { roleId, modul, lihat: lihat ?? false, buat: buat ?? false, ubah: ubah ?? false, hapus: hapus ?? false, proses: proses ?? false, setujui: setujui ?? false, export: exp ?? false },
    });
    res.json(data);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});

// UPDATE user permission override
router.put('/users/:userId/permissions', async (req, res) => {
  try {
    const { userId } = req.params;
    const { modul, lihat, buat, ubah, hapus, proses, setujui, export: exp } = req.body;
    const data = await req.prisma.userPermission.upsert({
      where: { userId_modul: { userId, modul } },
      update: { lihat, buat, ubah, hapus, proses, setujui, export: exp },
      create: { userId, modul, lihat: lihat ?? false, buat: buat ?? false, ubah: ubah ?? false, hapus: hapus ?? false, proses: proses ?? false, setujui: setujui ?? false, export: exp ?? false },
    });
    res.json(data);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});

export default router;
