import { StatusCodes } from 'http-status-codes';
import crypto from 'crypto';
import db from '../../models/index.js';

const { sequelize, Order, PaymentIntent } = db;

// POST /api/v1/payments/initiate body: { orderId }
export const initiatePayment = async (req, res) => {
  let t;
  try {
    const userId = req.user?.id;
    const { orderId } = req.body || {};
    if (!userId) return res.status(StatusCodes.UNAUTHORIZED).json({ success: false, message: 'Unauthorized' });
    if (!orderId) return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: 'orderId required' });

    const order = await Order.findByPk(orderId);
    if (!order || order.userId !== userId) {
      return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Order not found' });
    }
    if (order.status !== 'pending') {
      return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: 'Order already processed or not payable' });
    }

    t = await sequelize.transaction();
    // Create a dummy provider reference (simulate external gateway intent id)
    const providerRef = 'pi_' + crypto.randomBytes(10).toString('hex');
    const intent = await PaymentIntent.create({
      orderId: order.id,
      userId,
      amount: order.total,
      currency: order.currency,
      provider: 'dummy',
      providerRef,
      status: 'pending'
    }, { transaction: t });
    await t.commit();

    return res.status(StatusCodes.CREATED).json({ success: true, paymentIntent: intent });
  } catch (error) {
    if (t) { try { await t.rollback(); } catch {} }
    console.error(error?.message || error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: error?.message || 'Failed to initiate payment' });
  }
};

// POST /api/v1/payments/verify body: { paymentIntentId, success }
export const verifyPayment = async (req, res) => {
  let t;
  try {
    const userId = req.user?.id;
    const { paymentIntentId, success } = req.body || {};
    if (!userId) return res.status(StatusCodes.UNAUTHORIZED).json({ success: false, message: 'Unauthorized' });
    if (!paymentIntentId) return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: 'paymentIntentId required' });

    const intent = await PaymentIntent.findByPk(paymentIntentId);
    if (!intent || intent.userId !== userId) {
      return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Payment intent not found' });
    }

    if (intent.status === 'succeeded') {
      return res.status(StatusCodes.OK).json({ success: true, message: 'Already succeeded', paymentIntent: intent });
    }
    if (intent.status === 'failed') {
      return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: 'Payment previously failed', paymentIntent: intent });
    }

    t = await sequelize.transaction();
    if (success) {
      await intent.update({ status: 'succeeded' }, { transaction: t });
      // Mark order paid
      const order = await Order.findByPk(intent.orderId, { transaction: t });
      if (order && order.status === 'pending') {
        await order.update({ status: 'paid' }, { transaction: t });
      }
    } else {
      await intent.update({ status: 'failed' }, { transaction: t });
    }
    await t.commit();

    return res.status(StatusCodes.OK).json({ success: true, paymentIntent: intent });
  } catch (error) {
    if (t) { try { await t.rollback(); } catch {} }
    console.error(error?.message || error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: error?.message || 'Failed to verify payment' });
  }
};
