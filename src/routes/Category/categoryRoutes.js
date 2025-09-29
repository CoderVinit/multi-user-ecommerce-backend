import express from "express"
import { authenticate, authorizeRoles } from "../../middleware/auth.js";
import { GetAllCategories, CreateCategory, getCategoryById, UpdateCategory, DeleteCategory } from "../../controller/Category/categoryController.js";


const router = express.Router();


router.post("/create", authenticate, authorizeRoles("admin"), CreateCategory);
router.get("/all", GetAllCategories);
router.get("/:id", getCategoryById);
router.put("/:id", authenticate, authorizeRoles("admin"), UpdateCategory);
router.delete("/:id", authenticate, authorizeRoles("admin"), DeleteCategory);





export default router;