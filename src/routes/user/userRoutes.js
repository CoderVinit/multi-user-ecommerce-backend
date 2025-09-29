import express from 'express';
import { authenticate, authorizeRoles, authorizeSelfOrRoles } from '../../middleware/auth.js';
import { getUserById, updateUserById, deleteUserById, CreateVendor } from '../../controller/user/userController.js';

const router = express.Router();

// GET /v1/users/:id → Get user by ID (self or admin)
router.get(
  '/:id',
  authenticate,
  authorizeSelfOrRoles((req) => req.params.id, 'admin'),
  getUserById
);

// PUT /v1/users/:id → Update user profile (self; admin can update any)
router.put(
  '/:id',
  authenticate,
  authorizeSelfOrRoles((req) => req.params.id, 'admin'),
  updateUserById
);

// DELETE /v1/users/:id → Delete user (admin only)
router.delete(
  '/:id',
  authenticate,
  authorizeRoles('admin'),
  deleteUserById
);

// Vendors

router.post("/profile",
    authenticate,
    authorizeRoles("vendor"),
    CreateVendor);

export default router;