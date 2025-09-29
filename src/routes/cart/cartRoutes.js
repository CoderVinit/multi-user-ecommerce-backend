import express from 'express';
import { authenticate, authorizeRoles } from '../../middleware/auth.js';
import { addToCart, ClearCart, GetAllCart, removeFromCart } from '../../controller/cart/cartController.js';


const router = express.Router();

router.post("/add",authenticate,authorizeRoles("customer"),addToCart);
router.post("/remove",authenticate,authorizeRoles("customer"),removeFromCart);
router.get("/",authenticate,authorizeRoles("customer"),GetAllCart)
router.delete("/clear",authenticate,authorizeRoles("customer"),ClearCart)



export default router;