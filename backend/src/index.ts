import express, { Router } from 'express';
import cors from 'cors';
import path from 'path';
import 'dotenv/config';

import authRoutes from './routes/authRoutes';
import satuanBarangRoutes from './routes/satuanBarangRoutes';
import produkRoutes from './routes/produkRoutes';
import pemasokRoutes from './routes/pemasokRoutes';
import cabangRoutes from './routes/cabangRoutes';
import gudangRoutes from './routes/gudangRoutes';
import purchaseOrderRoutes from './routes/purchaseOrderRoutes';
import operasionalRoutes from './routes/operasionalRoutes';
import pengendalianRoutes from './routes/pengendalianRoutes';
import taskRoutes from './routes/taskRoutes';
import adminRoutes from './routes/adminRoutes';
import uploadRoutes from './routes/uploadRoutes';
import { requireAuth, requireRole } from './middleware/authMiddleware';
import { unitBisnisMiddleware } from './middleware/unitBisnisMiddleware';

const app = express();
const port = process.env.PORT || 3000;

app.set('trust proxy', 1);   // ← tambahkan baris ini di sini

app.use(cors({
  origin: ['https://jawarastokopname.onrender.com', 'http://localhost:5173']
}));
app.use(express.json());

// Serve uploaded files as static (foto retur, pengembalian, dll)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * Semua rute per-unit-bisnis dipasang di sini, TANPA prefix /api di dalamnya.
 * Router ini kemudian di-mount dua kali di bawah dengan prefix
 * /api/fotosnaps dan /api/keripik-bujangan, masing-masing dengan
 * koneksi Prisma (database) yang berbeda lewat unitBisnisMiddleware.
 */
function buildUnitRouter() {
  const router = Router();

  // Rute publik (tidak butuh token) — tapi tetap butuh tahu unit bisnis mana (dari prefix URL)
  router.use('/auth', authRoutes);

  // Mulai dari sini, semua rute wajib login
  router.use(requireAuth);

  // Data Master
  router.use('/satuan-barang', satuanBarangRoutes);
  router.use('/produk', produkRoutes);
  router.use('/pemasok', pemasokRoutes);
  router.use('/cabang', cabangRoutes);
  router.use('/gudang', gudangRoutes);

  // Barang Masuk
  router.use('/purchase-order', purchaseOrderRoutes);

  // Operasional (Inventory, SO, Retur, Movement)
  router.use('/operasional', operasionalRoutes);

  // Pengendalian (Cycle Count, Adjustment, Pengembalian ke Pemasok, Waste)
  router.use('/pengendalian', pengendalianRoutes);

  // Tugas, Notifikasi, Dashboard
  router.use('/', taskRoutes);

  // Administrasi (User & Role) — khusus SUPER ADMIN & ADMIN
  router.use('/admin', requireRole(['SUPER ADMIN', 'ADMIN']), adminRoutes);

  // Upload (foto retur & pengembalian pemasok)
  router.use('/upload', uploadRoutes);

  return router;
}

// === Section Fotosnaps: semua endpoint di bawah /api/fotosnaps/* pakai database "fotosnaps" ===
app.use('/api/fotosnaps', unitBisnisMiddleware('FOTOSNAPS'), buildUnitRouter());

// === Section Keripik Bujangan: semua endpoint di bawah /api/keripik-bujangan/* pakai database "keripik-bujangan" ===
app.use('/api/keripik-bujangan', unitBisnisMiddleware('KERIPIK_BUJANGAN'), buildUnitRouter());

app.listen(port, () => {
  console.log(`[WMS Server] Berjalan di http://localhost:${port}`);
  console.log(`  - Fotosnaps:        http://localhost:${port}/api/fotosnaps`);
  console.log(`  - Keripik Bujangan: http://localhost:${port}/api/keripik-bujangan`);
});
