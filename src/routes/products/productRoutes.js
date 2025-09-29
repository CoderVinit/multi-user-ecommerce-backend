import express from "express"
import { AddProduct, DeleteProduct, GetAllProducts, GetProductById, UpdateProduct } from "../../controller/product/productController.js";
import { authenticate, authorizeRoles } from "../../middleware/auth.js";

const router = express.Router();


router.post("/create", authenticate, authorizeRoles("vendor"), AddProduct);
router.get("/getAllProducts", GetAllProducts);
router.get("/getProduct/:id", GetProductById);
router.put("/updateProduct/:id", authenticate, authorizeRoles("vendor","admin"), UpdateProduct);
router.delete("/deleteProduct/:id", authenticate, authorizeRoles("vendor","admin"), DeleteProduct);


export default router;