import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Order extends Model {
    static associate(models) {
      Order.belongsTo(models.User, { foreignKey: 'userId', as: 'customer' });
      Order.hasMany(models.OrderItem, { foreignKey: 'orderId', as: 'items', onDelete: 'CASCADE' });
    }
  }

  Order.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' } },
  // Expanded statuses to support fulfillment lifecycle
  status: { type: DataTypes.ENUM('pending','paid','shipped','delivered','cancelled'), allowNull: false, defaultValue: 'pending' },
    total: { type: DataTypes.DECIMAL(12,2), allowNull: false, defaultValue: 0 },
    currency: { type: DataTypes.STRING, allowNull: false, defaultValue: 'INR' }
  }, {
    sequelize,
    modelName: 'Order',
    tableName: 'orders',
    indexes: [ { fields: ['userId'] }, { fields: ['status'] } ]
  });
  return Order;
};
