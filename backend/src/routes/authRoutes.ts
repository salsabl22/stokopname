import { Router } from 'express';
import { login, getMe, register } from '../controllers/authController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

// Publik: tidak butuh token
router.post('/login', login);
router.post('/register', register); // Pendaftaran akun baru (pending admin approval)

// Privat: butuh token, dipasang di sini karena authRoutes
// didaftarkan sebelum middleware requireAuth global di index.ts
router.get('/me', requireAuth, getMe);

export default router;
