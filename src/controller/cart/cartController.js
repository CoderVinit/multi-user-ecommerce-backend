import db from "../../models/index.js";
import { StatusCodes } from "http-status-codes";

const { User, Product, Cart, CartItem, sequelize } = db;

// POST /api/v1/cart/add  (example path) - body: { productId, quantity }
export const addToCart = async (req, res) => {
  let t;
  try {
    const userId = req.user?.id;
    const { productId, quantity } = req.body || {};

    const prodIdNum = Number(productId);
    const qtyNum = Number(quantity);
    if (!userId || Number.isNaN(prodIdNum) || Number.isNaN(qtyNum) || qtyNum <= 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: "Invalid productId or quantity" });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: "User not found" });
    }

    const product = await Product.findByPk(prodIdNum);
    if (!product || !product.isActive) {
      return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: "Product not found or inactive" });
    }

    if (product.stock < qtyNum) {
      return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: "Insufficient stock" });
    }

    t = await sequelize.transaction();

    // Find or create cart (one per user)
    let cart = await Cart.findOne({ where: { userId }, transaction: t });
    if (!cart) {
      cart = await Cart.create({ userId }, { transaction: t });
    }

    // Find existing cart item
    let item = await CartItem.findOne({ where: { cartId: cart.id, productId: prodIdNum }, transaction: t });
    if (item) {
      const newQty = item.quantity + qtyNum;
      if (newQty > product.stock) {
        await t.rollback();
        return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: "Quantity exceeds available stock" });
      }
      await item.update({ quantity: newQty }, { transaction: t });
    } else {
      if (qtyNum > product.stock) {
        await t.rollback();
        return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: "Quantity exceeds available stock" });
      }
      item = await CartItem.create({ cartId: cart.id, productId: prodIdNum, quantity: qtyNum }, { transaction: t });
    }

    await t.commit();

    // Reload cart with items & products
    const updatedCart = await Cart.findByPk(cart.id, {
      include: [
        {
          model: CartItem,
          as: 'items',
            include: [
              { model: Product, as: 'product', attributes: ['id', 'name', 'price', 'stock'] }
            ]
        }
      ]
    });

    return res.status(StatusCodes.OK).json({ success: true, message: 'Item added to cart', cart: updatedCart });
  } catch (error) {
    if (t) { try { await t.rollback(); } catch { /* ignore */ } }
    console.error(error?.message || error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: error?.message || 'Failed to add to cart' });
  }
};

export const removeFromCart = async (req, res) => {
  let t;
  try {
    const userId = req.user?.id;
    const { productId, quantity } = req.body || {};

    if (!userId) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ success: false, message: 'Unauthorized' });
    }

    const prodIdNum = Number(productId);
    if (Number.isNaN(prodIdNum)) {
      return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: 'Invalid productId' });
    }

    // Optional decrement quantity; if not provided -> remove entire item
    const qtyNum = quantity !== undefined ? Number(quantity) : undefined;
    if (qtyNum !== undefined && (Number.isNaN(qtyNum) || qtyNum <= 0)) {
      return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: 'Invalid quantity' });
    }

    const cart = await Cart.findOne({ where: { userId } });
    if (!cart) {
      return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Cart not found' });
    }

    t = await sequelize.transaction();

    const item = await CartItem.findOne({ where: { cartId: cart.id, productId: prodIdNum }, transaction: t });
    if (!item) {
      await t.rollback();
      return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Item not found in cart' });
    }

    if (qtyNum !== undefined && qtyNum < item.quantity) {
      // Decrement quantity
      const newQty = item.quantity - qtyNum;
      await item.update({ quantity: newQty }, { transaction: t });
    } else {
      // Remove item entirely (qty >= existing or no qty provided)
      await item.destroy({ transaction: t });
    }

    await t.commit();

    // Reload updated cart
    const updatedCart = await Cart.findByPk(cart.id, {
      include: [
        {
          model: CartItem,
          as: 'items',
          include: [ { model: Product, as: 'product', attributes: ['id', 'name', 'price', 'stock'] } ]
        }
      ]
    });

    return res.status(StatusCodes.OK).json({ success: true, message: 'Cart updated', cart: updatedCart });
  } catch (error) {
    if (t) { try { await t.rollback(); } catch { /* ignore */ } }
    console.error(error?.message || error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: error?.message || 'Failed to remove from cart' });
  }
};

export const GetAllCart = async(req,res)=>{
    try {
        const userId = req.user?.id;
        if(!userId){
            return res.status(StatusCodes.UNAUTHORIZED).json({success:false,message:"Unauthorized"});
        }
        const cart = await Cart.findOne({where:{userId},include:[
            {
                model: CartItem,
                as: 'items',
                include: [ { model: Product, as: 'product', attributes: ['id', 'name', 'price'] } ]
            }
        ]});
        if(!cart){
            return res.status(StatusCodes.NOT_FOUND).json({success:false,message:"Cart not found"});
        }
        return res.status(StatusCodes.OK).json({success:true,cart});
    } catch (error) {
        console.error(error?.message || error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({success:false,message:error?.message || 'Failed to retrieve cart'});
    }
}

export const ClearCart = async(req,res)=>{
    try {
        const userId = req.user?.id;
        if(!userId){
            return res.status(StatusCodes.UNAUTHORIZED).json({success:false,message:"Unauthorized"});
        }
        const cart = await Cart.findOne({where:{userId}});
        if(!cart){
            return res.status(StatusCodes.NOT_FOUND).json({success:false,message:"Cart not found"});
        }
        await CartItem.destroy({ where: { cartId: cart.id } });
        return res.status(StatusCodes.OK).json({success:true,message:"Cart cleared successfully"});
    } catch (error) {
        console.error(error?.message || error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({success:false,message:error?.message || 'Failed to clear cart'});
    }
}
