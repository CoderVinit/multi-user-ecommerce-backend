
/**
 * Migration: Align the orders.status ENUM with application code.
 * Adds 'shipped' and removes legacy 'processing'. Any existing rows using
 * 'processing' are mapped to 'paid' before the ENUM alteration to avoid errors.
 *
 * Safe for MySQL. If using a different dialect, adjust raw SQL accordingly.
 */
export default {
  async up (queryInterface, Sequelize) {
    // 1. If table does not exist (fresh environment), create with correct schema
    const tables = await queryInterface.showAllTables();
    const hasOrders = tables.includes('orders');

    if (!hasOrders) {
      await queryInterface.createTable('orders', {
        id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
        userId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
        status: { type: Sequelize.ENUM('pending','paid','shipped','delivered','cancelled'), allowNull: false, defaultValue: 'pending' },
        total: { type: Sequelize.DECIMAL(12,2), allowNull: false, defaultValue: 0 },
        currency: { type: Sequelize.STRING, allowNull: false, defaultValue: 'INR' },
        createdAt: { allowNull: false, type: Sequelize.DATE },
        updatedAt: { allowNull: false, type: Sequelize.DATE }
      });
      await queryInterface.addIndex('orders',['userId'],{ name: 'orders_user_id_idx'});
      await queryInterface.addIndex('orders',['status'],{ name: 'orders_status_idx'});
      return;
    }

    // 2. Normalize existing legacy value 'processing' -> 'paid' if present
    try {
      await queryInterface.sequelize.query("UPDATE `orders` SET `status`='paid' WHERE `status`='processing'");
    } catch (e) {
      // ignore if column/value mismatch
    }

    // 3. For MySQL: modify ENUM list to desired values
    // NOTE: Direct ALTER needed; Sequelize doesn't support altering ENUM cleanly for MySQL.
    // If already correct, this will succeed no-op.
    try {
      await queryInterface.sequelize.query("ALTER TABLE `orders` MODIFY COLUMN `status` ENUM('pending','paid','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending'");
    } catch (e) {
      console.warn('Warning altering orders.status enum:', e.message || e);
    }
  },

  async down (queryInterface, Sequelize) {
    // Revert to previous set including 'processing' and without 'shipped'
    try {
      await queryInterface.sequelize.query("ALTER TABLE `orders` MODIFY COLUMN `status` ENUM('pending','paid','processing','delivered','cancelled') NOT NULL DEFAULT 'pending'");
    } catch (e) {
      console.warn('Warning reverting orders.status enum:', e.message || e);
    }
  }
};
