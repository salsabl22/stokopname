import { Router } from 'express';
import {
  getGudang, createGudang, deleteGudang,
  createRak, deleteRak,
  createLokasi, deleteLokasi,
  getAllFlatLocations
} from '../controllers/gudangController';

const router = Router();
router.get('/', getGudang);
router.post('/', createGudang);
router.delete('/:id', deleteGudang);

router.post('/rak', createRak);
router.delete('/rak/:id', deleteRak);

router.post('/lokasi', createLokasi);
router.delete('/lokasi/:id', deleteLokasi);
router.get('/flat-locations', getAllFlatLocations);

export default router;
