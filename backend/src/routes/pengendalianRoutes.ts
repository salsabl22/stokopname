import { Router } from 'express';
import {
  getCycleCounts, createCycleCount, updateCycleCountItem, deleteCycleCount,
  getStockAdjustments, createStockAdjustment, approveStockAdjustment, deleteStockAdjustment,
  getExceptions, createException, resolveException, deleteException,
  getWaste, createWaste, deleteWaste,
  resetAllPengendalianData,
} from '../controllers/pengendalianController';

const router = Router();

router.get('/cycle-count', getCycleCounts);
router.post('/cycle-count', createCycleCount);
router.put('/cycle-count/item/:itemId', updateCycleCountItem);
router.delete('/cycle-count/reset-all', resetAllPengendalianData);
router.delete('/cycle-count/:id', deleteCycleCount);

router.get('/adjustment', getStockAdjustments);
router.post('/adjustment', createStockAdjustment);
router.put('/adjustment/:id/approve', approveStockAdjustment);
router.delete('/adjustment/:id', deleteStockAdjustment);

// Exception
router.get('/exceptions', getExceptions);
router.post('/exceptions', createException);
router.put('/exceptions/:id/resolve', resolveException);
router.delete('/exceptions/:id', deleteException);

// Waste
router.get('/waste', getWaste);
router.post('/waste', createWaste);
router.delete('/waste/:id', deleteWaste);

export default router;
