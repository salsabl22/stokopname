import { Router } from 'express';
import { getPurchaseOrders, createPurchaseOrder, updatePOStatus, deletePurchaseOrder } from '../controllers/purchaseOrderController';

const router = Router();
router.get('/', getPurchaseOrders);
router.post('/', createPurchaseOrder);
router.put('/:id/status', updatePOStatus);
router.delete('/:id', deletePurchaseOrder);

export default router;
