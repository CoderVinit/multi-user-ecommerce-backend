import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class OrderItem extends Model {
    static associate(models) {
      OrderItem.belongsTo(models.Order, { foreignKey: 'orderId', as: 'order', onDelete: 'CASCADE' });
      OrderItem.belongsTo(models.Product, { foreignKey: 'productId', as: 'product' });
      OrderItem.belongsTo(models.User, { foreignKey: 'vendorId', as: 'vendor' });
    }
  }

  OrderItem.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    orderId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'orders', key: 'id' } },
    productId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'products', key: 'id' } },
    vendorId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' } },
    quantity: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1 } },
    price: { type: DataTypes.DECIMAL(10,2), allowNull: false },
    lineTotal: { type: DataTypes.DECIMAL(12,2), allowNull: false }
  }, {
    sequelize,
    modelName: 'OrderItem',
    tableName: 'order_items',
    indexes: [ { fields: ['orderId'] }, { fields: ['vendorId'] } ]
  });
  return OrderItem;
};