import { Router } from 'express';
import {
  getInventory,
  getSalesOrders, createSalesOrder, updateSOStatus, savePackingResult, deleteSalesOrder,
  getReturns, createReturn, updateReturStatus, deleteRetur,
  getStockMovements, deleteStockMovement,
  deleteInventoryItem,
  resetAllOperasionalData,
} from '../controllers/operasionalController';

const router = Router();

// Inventory
router.get('/inventory', getInventory);
router.delete('/inventory/:id', deleteInventoryItem);

// Sales Order
router.get('/sales-order', getSalesOrders);
router.post('/sales-order', createSalesOrder);
router.put('/sales-order/:id/status', updateSOStatus);
router.post('/sales-order/:id/packing', savePackingResult);
router.delete('/sales-order/reset-all', resetAllOperasionalData);
router.delete('/sales-order/:id', deleteSalesOrder);

// Retur
router.get('/retur', getReturns);
router.post('/retur', createReturn);
router.put('/retur/:id/status', updateReturStatus);
router.delete('/retur/:id', deleteRetur);

// Stock Movement
router.get('/stock-movement', getStockMovements);
router.delete('/stock-movement/:id', deleteStockMovement);

export default router;
