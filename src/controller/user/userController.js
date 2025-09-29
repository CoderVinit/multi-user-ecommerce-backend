import { StatusCodes } from 'http-status-codes';
import bcrypt from 'bcrypt';
import db from '../../models/index.js';

const { User } = db;

// GET /v1/users/:id (self or admin)
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || Number.isNaN(Number(id))) {
      return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: 'Invalid user id' });
    }
    const user = await User.findByPk(id, { attributes: { exclude: ['password'] } });
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'User not found' });
    }
    return res.status(StatusCodes.OK).json({ success: true, user });
  } catch (error) {
    console.error(error?.message || error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: error?.message || 'Failed to get user' });
  }
};

// PUT /v1/users/:id (self; admin can update any)
export const updateUserById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || Number.isNaN(Number(id))) {
      return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: 'Invalid user id' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'User not found' });
    }

    const { name, email, password, role } = req.body || {};

    // Only allow role update if current user is admin
    const canUpdateRole = req.user?.role === 'admin';

    const updates = {};
    if (typeof name === 'string' && name.trim()) updates.name = name.trim();
    if (typeof email === 'string' && email.trim()) updates.email = email.trim();
    if (typeof password === 'string' && password.trim()) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(password, salt);
    }
    if (canUpdateRole && typeof role === 'string' && role.trim()) updates.role = role.trim();

    // Nothing to update
    if (Object.keys(updates).length === 0) {
      const { password: _ignored, ...safe } = user.get({ plain: true });
      return res.status(StatusCodes.OK).json({ success: true, user: safe });
    }

    await user.update(updates);
    const { password: _ignored, ...safeUser } = user.get({ plain: true });
    return res.status(StatusCodes.OK).json({ success: true, message: 'User updated successfully', user: safeUser });
  } catch (error) {
    console.error(error?.message || error);
    // Handle unique email constraint gracefully
    if (error?.name === 'SequelizeUniqueConstraintError') {
      return res.status(StatusCodes.CONFLICT).json({ success: false, message: 'Email already in use' });
    }
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: error?.message || 'Failed to update user' });
  }
};

// DELETE /v1/users/:id (admin only)
export const deleteUserById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || Number.isNaN(Number(id))) {
      return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: 'Invalid user id' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'User not found' });
    }

    await user.destroy();
    return res.status(StatusCodes.OK).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error(error?.message || error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: error?.message || 'Failed to delete user' });
  }
};


export const CreateVendor = async(req,res)=>{
}