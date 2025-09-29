import { StatusCodes } from 'http-status-codes';
import db from '../../models/index.js';

const { User, VendorProfile, Product, Category, sequelize } = db;

// POST /v1/vendors/profile (also /api/vendors/profile)
// Vendor only: Create or update own vendor profile
export const upsertVendorProfile = async (req, res) => {
    const t = await sequelize.transaction();    
  try {
    const userId = req.user?.id;
    if (!userId) {
        await t.rollback();
      return res.status(StatusCodes.UNAUTHORIZED).json({ success: false, message: 'Unauthorized' });
    }

    const { shopName, gstin, address } = req.body || {};
    if (!shopName || !shopName.trim()) {
        await t.rollback();
      return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: 'shopName is required' });
    }

    const existing = await VendorProfile.findOne({ where: { userId } });
    if (existing) {
      await existing.update({ shopName: shopName.trim(), gstin: gstin?.trim() || null, address: address || null });
      return res.status(StatusCodes.OK).json({ success: true, message: 'Vendor profile updated', profile: existing });
    }

    const profile = await VendorProfile.create({ userId, shopName: shopName.trim(), gstin: gstin?.trim() || null, address: address || null });
    return res.status(StatusCodes.CREATED).json({ success: true, message: 'Vendor profile created', profile });
  } catch (error) {
    console.error(error?.message || error);
    if (error?.name === 'SequelizeValidationError') {
      return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: error.errors?.[0]?.message || 'Validation error' });
    }
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: error?.message || 'Failed to upsert vendor profile' });
  }
};

// GET /v1/vendors/:id (also /api/vendors/:id) - Public
export const getVendorById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || Number.isNaN(Number(id))) {
      return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: 'Invalid vendor id' });
    }

    const vendor = await User.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [{ model: VendorProfile, as: 'vendorProfile' }]
    });

    if (!vendor || vendor.role !== 'vendor') {
      return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Vendor not found' });
    }

    return res.status(StatusCodes.OK).json({ success: true, vendor });
  } catch (error) {
    console.error(error?.message || error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: error?.message || 'Failed to get vendor' });
  }
};

// GET /v1/vendors/:id/products (also /api/vendors/:id/products) - Public
export const getVendorProducts = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || Number.isNaN(Number(id))) {
      return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: 'Invalid vendor id' });
    }

    // Optional: ensure the user exists and is a vendor
    const vendor = await User.findByPk(id);
    if (!vendor || vendor.role !== 'vendor') {
      return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Vendor not found' });
    }

    const products = await Product.findAll({
      where: { vendorId: id, isActive: true },
      include: [{ model: Category, as: 'category' }]
    });

    return res.status(StatusCodes.OK).json({ success: true, products });
  } catch (error) {
    console.error(error?.message || error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: error?.message || 'Failed to get products' });
  }
};
