import { StatusCodes } from 'http-status-codes';
import db from '../../models/index.js';

const { sequelize, User, Product, Cart, CartItem, Order, OrderItem } = db;

// POST /api/v1/orders/checkout (customer only)
// export const checkout = async (req, res) => {
//   let t;
//   try {
//     const userId = req.user?.id;
//     if (!userId) return res.status(StatusCodes.UNAUTHORIZED).json({ success: false, message: 'Unauthorized' });

//     const cart = await Cart.findOne({ where: { userId }, include: [{ model: CartItem, as: 'items' }] });
//     if (!cart || !cart.items.length) {
//       return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: 'Cart is empty' });
//     }

//     // Fetch product details for all items
//     const productIds = cart.items.map(i => i.productId);
//     const products = await Product.findAll({ where: { id: productIds } });
//     const productMap = new Map(products.map(p => [p.id, p]));

//     // Validate stock & active
//     for (const item of cart.items) {
//       const p = productMap.get(item.productId);
//       if (!p || !p.isActive) {
//         return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: `Product ${item.productId} unavailable` });
//       }
//       if (p.stock < item.quantity) {
//         return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: `Insufficient stock for product ${p.id}` });
//       }
//     }

//     t = await sequelize.transaction();

//     // Create order
//     let total = 0;
//     const order = await Order.create({ userId, total: 0, status: 'pending', currency: 'INR' }, { transaction: t });

//     for (const item of cart.items) {
//       const p = productMap.get(item.productId);
//       const lineTotal = Number(p.price) * item.quantity;
//       total += lineTotal;
//       await OrderItem.create({
//         orderId: order.id,
//         productId: p.id,
//         vendorId: p.vendorId,
//         quantity: item.quantity,
//         price: p.price,
//         lineTotal
//       }, { transaction: t });
//       // Deduct stock
//       await p.update({ stock: p.stock - item.quantity }, { transaction: t });
//     }

//     await order.update({ total }, { transaction: t });

//     // Clear cart items
//     await CartItem.destroy({ where: { cartId: cart.id }, transaction: t });

//     await t.commit();

//     const fullOrder = await Order.findByPk(order.id, {
//       include: [
//         { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product', attributes: ['id','name','price'] }] }
//       ]
//     });

//     return res.status(StatusCodes.CREATED).json({ success: true, message: 'Order created', order: fullOrder });
//   } catch (error) {
//     if (t) { try { await t.rollback(); } catch { /* ignore */ } }
//     console.error(error?.message || error);
//     return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: error?.message || 'Checkout failed' });
//   }
// };

export const checkout = async (req, res) => {
    try {
    const userId = req.user?.id;
    if(!userId) return res.status(StatusCodes.UNAUTHORIZED).json({ success: false, message: 'Unauthorized' });
    const cart = await Cart.findOne({ where: { userId }, include: [{ model: CartItem, as: 'items' }] });
    if(!cart || !cart.items.length) {
        return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: 'Cart is empty' });
    }

    const productIds = cart.items.map(i=>i.productId);
    const products = await Product.findAll({where: { id: productIds }});
    const productMap = new Map(products.map(p=>[p.id,p]));
    console.log(productMap,"sfsdfdsf")

    for(let item of cart.items){
        const p = productMap.get(item.productId);
        console.log(p)
        if(!p || !p.isActive){
            return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: `Product ${item.productId} unavailable` });
        }
        if(p.stock < item.quantity){
            return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: `Insufficient stock for product ${p.id}` });
        }
    }

    let t = await sequelize.transaction();

    let total = 0;
    const order = await Order.create({userId, total: 0, status: 'pending', currency: 'INR'}, { transaction: t });

    for(let item of cart.items){
        const p = productMap.get(item.productId);
        const lineTotal = Number(p.price) * item.quantity;
        total += lineTotal;
        await OrderItem.create({
            orderId: order.id,
            productId: p.id,
            vendorId: p.vendorId,
            quantity: item.quantity,
            price: p.price,
            lineTotal
        }, { transaction: t });
        await p.update({ stock: p.stock - item.quantity }, { transaction: t });
    }
    await order.update({ total }, { transaction: t });
    await CartItem.destroy({ where: { cartId: cart.id }, transaction: t });

    await t.commit();

    const fullOrder = await Order.findByPk(order.id,{
        include: [
            {
                model: OrderItem,
                as: 'items',
                include: [{ model: Product, as: 'product', attributes: ['id','name','price'] }]
            }
        ]
    })

    return res.status(StatusCodes.CREATED).json({ success: true, message: 'Order created', order: fullOrder });



    } catch (error) {
        console.error(error?.message || error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: error?.message || 'Checkout failed' });
    }
}


// GET /api/v1/orders (customer: own; vendor: orders containing their products; admin: all)
export const listOrders = async (req, res) => {
  try {
    const { role, id: userId } = req.user || {};
    if (!userId) return res.status(StatusCodes.UNAUTHORIZED).json({ success: false, message: 'Unauthorized' });

    let where = {};
    let include = [ { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product', attributes: ['id','name','price','vendorId'] }] } ];

    if (role === 'customer') {
      where.userId = userId;
    } else if (role === 'vendor') {
      // Filter orders that have at least one item with vendorId = userId
      include[0].where = { vendorId: userId };
      include[0].required = true; // inner join to filter
    } // admin sees all

    const orders = await Order.findAll({ where, include, order: [['createdAt','DESC']] });
    return res.status(StatusCodes.OK).json({ success: true, orders });
  } catch (error) {
    console.error(error?.message || error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: error?.message || 'Failed to list orders' });
  }
};

// GET /api/v1/orders/:id
export const getOrderById = async (req, res) => {
  try {
    const { role, id: userId } = req.user || {};
    const { id } = req.params;
    if (!userId) return res.status(StatusCodes.UNAUTHORIZED).json({ success: false, message: 'Unauthorized' });

    const order = await Order.findByPk(id, {
      include: [ { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product', attributes: ['id','name','price','vendorId'] }] } ]
    });
    if (!order) return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Order not found' });

    if (role === 'customer' && order.userId !== userId) {
      return res.status(StatusCodes.FORBIDDEN).json({ success: false, message: 'Forbidden' });
    }
    if (role === 'vendor') {
      const hasItem = order.items.some(it => it.product.vendorId === userId);
      if (!hasItem) return res.status(StatusCodes.FORBIDDEN).json({ success: false, message: 'Forbidden' });
    }

    return res.status(StatusCodes.OK).json({ success: true, order });
  } catch (error) {
    console.error(error?.message || error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: error?.message || 'Failed to get order' });
  }
};

// PUT /api/v1/orders/:id/cancel (customer owner or admin)
export const cancelOrder = async (req, res) => {
  let t;
  try {
    const { role, id: userId } = req.user || {};
    const { id } = req.params;
    if (!userId) return res.status(StatusCodes.UNAUTHORIZED).json({ success: false, message: 'Unauthorized' });

    const order = await Order.findByPk(id, { include: [{ model: OrderItem, as: 'items' }] });
    if (!order) return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Order not found' });

    if (role === 'customer' && order.userId !== userId) {
      return res.status(StatusCodes.FORBIDDEN).json({ success: false, message: 'Forbidden' });
    }
    // vendor cannot cancel unless they are also the customer; only admin or owning customer
    if (role === 'vendor' && order.userId !== userId) {
      return res.status(StatusCodes.FORBIDDEN).json({ success: false, message: 'Forbidden' });
    }

    if (order.status === 'cancelled') {
      return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: 'Order already cancelled' });
    }

    t = await sequelize.transaction();

    // Restore stock
    for (const it of order.items) {
      const product = await Product.findByPk(it.productId, { transaction: t });
      if (product) {
        await product.update({ stock: product.stock + it.quantity }, { transaction: t });
      }
    }

    await order.update({ status: 'cancelled' }, { transaction: t });
    await t.commit();

    return res.status(StatusCodes.OK).json({ success: true, message: 'Order cancelled' });
  } catch (error) {
    if (t) { try { await t.rollback(); } catch { /* ignore */ } }
    console.error(error?.message || error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: error?.message || 'Failed to cancel order' });
  }
};
