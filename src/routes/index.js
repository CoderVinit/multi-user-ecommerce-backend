import express from 'express';
import userRouter from './user/userRoutes.js';
import authRouter from './auth/authRoutes.js'
import vendorRouter from './vendor/vendorRoutes.js'
import categoryRouter from './Category/categoryRoutes.js';
import productRouter from './products/productRoutes.js';
import cartRouter from './cart/cartRoutes.js';
import orderRouter from './order/orderRoutes.js';
import paymentRouter from './payment/paymentRoutes.js';
import adminRouter from './admin/adminRoutes.js'


const router = express.Router();

router.use("/v1/auth",authRouter)
router.use("/v1/users",userRouter);
router.use("/v1/vendors", vendorRouter);
router.use("/v1/categories", categoryRouter);
router.use("/v1/products", productRouter);
router.use("/v1/cart", cartRouter);
router.use("/v1/orders", orderRouter);
router.use("/v1/payments", paymentRouter);
router.use("/v1/admin",adminRouter)



export default router;