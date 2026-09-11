import { Router } from 'express';
import {
  getCycleCounts, createCycleCount, updateCycleCountItem,
  getStockAdjustments, createStockAdjustment, approveStockAdjustment,
  getExceptions, createException, resolveException,
  getWaste, createWaste,
} from '../controllers/pengendalianController';

const router = Router();

router.get('/cycle-count', getCycleCounts);
router.post('/cycle-count', createCycleCount);
router.put('/cycle-count/item/:itemId', updateCycleCountItem);

router.get('/adjustment', getStockAdjustments);
router.post('/adjustment', createStockAdjustment);
router.put('/adjustment/:id/approve', approveStockAdjustment);

// Exception
router.get('/exceptions', getExceptions);
router.post('/exceptions', createException);
router.put('/exceptions/:id/resolve', resolveException);

// Waste
router.get('/waste', getWaste);
router.post('/waste', createWaste);

export default router;
