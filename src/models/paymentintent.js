import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class PaymentIntent extends Model {
    static associate(models) {
      PaymentIntent.belongsTo(models.Order, { foreignKey: 'orderId', as: 'order' });
      PaymentIntent.belongsTo(models.User, { foreignKey: 'userId', as: 'customer' });
    }
  }

  PaymentIntent.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    orderId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'orders', key: 'id' } },
    userId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' } },
    amount: { type: DataTypes.DECIMAL(12,2), allowNull: false },
    currency: { type: DataTypes.STRING, allowNull: false, defaultValue: 'INR' },
    provider: { type: DataTypes.STRING, allowNull: false, defaultValue: 'dummy' },
    providerRef: { type: DataTypes.STRING, allowNull: true },
    status: { type: DataTypes.ENUM('initiated','pending','succeeded','failed'), allowNull: false, defaultValue: 'initiated' },
    metadata: { type: DataTypes.JSON, allowNull: true }
  }, {
    sequelize,
    modelName: 'PaymentIntent',
    tableName: 'payment_intents',
    indexes: [ { fields: ['orderId'] }, { fields: ['userId'] }, { fields: ['status'] } ]
  });
  return PaymentIntent;
};