import { Router } from 'express';
import { getCabang, createCabang, updateCabang, deleteCabang } from '../controllers/cabangController';

const router = Router();
router.get('/', getCabang);
router.post('/', createCabang);
router.put('/:id', updateCabang);
router.delete('/:id', deleteCabang);

export default router;
