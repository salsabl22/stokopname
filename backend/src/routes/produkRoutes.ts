import { Router } from 'express';
import { getProduk, getProdukById, createProduk, updateProduk, deleteProduk } from '../controllers/produkController';

const router = Router();
router.get('/', getProduk);
router.get('/:id', getProdukById);
router.post('/', createProduk);
router.put('/:id', updateProduk);
router.delete('/:id', deleteProduk);

export default router;
