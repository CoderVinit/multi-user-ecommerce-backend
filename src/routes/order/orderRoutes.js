import express from 'express';
import { authenticate, authorizeRoles } from '../../middleware/auth.js';
import { cancelOrder, checkout, getOrderById, listOrders } from '../../controller/Order/orderController.js';

const router = express.Router();    


// Customer checkout
router.post('/checkout', authenticate, authorizeRoles('customer'), checkout);

// List orders (customer own; vendor filtered; admin all)
router.get('/', authenticate, authorizeRoles('customer','vendor','admin'), listOrders);

// Get order by id
router.get('/:id', authenticate, authorizeRoles('customer','vendor','admin'), getOrderById);

// Cancel order (customer owner or admin); vendor allowed but controller re-checks ownership
router.put('/:id/cancel', authenticate, authorizeRoles('customer','admin','vendor'), cancelOrder);

export default router;
