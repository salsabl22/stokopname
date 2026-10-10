import { Router } from 'express';
import { getPurchaseOrders, createPurchaseOrder, updatePOStatus, deletePurchaseOrder, resetAllPurchaseOrders } from '../controllers/purchaseOrderController';

const router = Router();
router.get('/', getPurchaseOrders);
router.post('/', createPurchaseOrder);
router.put('/:id/status', updatePOStatus);
router.delete('/reset-all', resetAllPurchaseOrders);
router.delete('/:id', deletePurchaseOrder);

export default router;
