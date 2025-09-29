import express from "express"
import { authenticate, authorizeRoles } from "../../middleware/auth.js";
import { deleteProductById, getAllOrders, getAllUsers, getAllVendors, updateOrderStatus } from "../../controller/admin/adminController.js";


const router = express.Router();


router.get("/users",authenticate,authorizeRoles("admin"),getAllUsers)
router.get("/vendors",authenticate,authorizeRoles("admin"),getAllVendors)
router.get("/orders",authenticate,authorizeRoles("admin"),getAllOrders)
router.put("/orders/:id/status",authenticate,authorizeRoles("admin"),updateOrderStatus)
router.delete("/product/:id",authenticate,authorizeRoles("admin"),deleteProductById)


export default router;