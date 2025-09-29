import express from 'express';
import { authenticate, authorizeRoles } from '../../middleware/auth.js';
import { upsertVendorProfile, getVendorById, getVendorProducts } from '../../controller/vendor/vendorController.js';

const router = express.Router();

// Vendor-only: create/update own profile
router.post('/profile', authenticate, authorizeRoles('vendor'), upsertVendorProfile);

// Public: get vendor details
router.get('/:id', getVendorById);

// Public: get vendor's product listings
router.get('/:id/products', getVendorProducts);

export default router;
