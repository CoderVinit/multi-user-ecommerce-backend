import express from 'express';
import { getProfile, LoginUser, RegisterUser } from '../../controller/auth/authController.js';
import { authenticate, authorizeRoles } from '../../middleware/auth.js';


const router = express.Router();



router.post("/register",RegisterUser);
router.post("/login",LoginUser);
router.get("/profile",authenticate,authorizeRoles("admin","customer","vendor"),getProfile)







export default router;