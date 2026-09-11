import { Router } from 'express';
import { getSatuanBarang, createSatuanBarang, updateSatuanBarang, deleteSatuanBarang } from '../controllers/satuanBarangController';

const router = Router();

router.get('/', getSatuanBarang);
router.post('/', createSatuanBarang);
router.put('/:id', updateSatuanBarang);
router.delete('/:id', deleteSatuanBarang);

export default router;
