import { Router } from 'express';
import {
  getInventory,
  getSalesOrders, createSalesOrder, updateSOStatus, savePackingResult,
  getReturns, createReturn, updateReturStatus,
  getStockMovements,
} from '../controllers/operasionalController';

const router = Router();

// Inventory
router.get('/inventory', getInventory);

// Sales Order
router.get('/sales-order', getSalesOrders);
router.post('/sales-order', createSalesOrder);
router.put('/sales-order/:id/status', updateSOStatus);
router.post('/sales-order/:id/packing', savePackingResult);

// Retur
router.get('/retur', getReturns);
router.post('/retur', createReturn);
router.put('/retur/:id/status', updateReturStatus);

// Stock Movement
router.get('/stock-movement', getStockMovements);

export default router;
