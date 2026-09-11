import { Router } from 'express';
import { getPemasok, createPemasok, updatePemasok, deletePemasok } from '../controllers/pemasokController';

const router = Router();
router.get('/', getPemasok);
router.post('/', createPemasok);
router.put('/:id', updatePemasok);
router.delete('/:id', deletePemasok);

export default router;
