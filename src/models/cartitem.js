'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class CartItem extends Model {
    static associate(models) {
      // Each CartItem belongs to a Cart
      CartItem.belongsTo(models.Cart, {
        foreignKey: 'cartId',
        as: 'cart',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
      // Each CartItem references a Product
      CartItem.belongsTo(models.Product, {
        foreignKey: 'productId',
        as: 'product',
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
      });
    }
  }

  CartItem.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: { min: 1 }
    },
    cartId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'carts', key: 'id' }
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'products', key: 'id' }
    }
  }, {
    sequelize,
    modelName: 'CartItem',
    tableName: 'cart_items',
    indexes: [
      { fields: ['cartId'] },
      { fields: ['productId'] },
      { unique: true, fields: ['cartId', 'productId'], name: 'cart_items_unique_product_per_cart' }
    ]
  });

  return CartItem;
};