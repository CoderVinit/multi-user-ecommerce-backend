'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Cart extends Model {
    /**
     * Associations are registered here by models/index.js
     */
    static associate(models) {
      // Each cart belongs to one user
      Cart.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
      // A cart has many cart items
      Cart.hasMany(models.CartItem, {
        foreignKey: 'cartId',
        as: 'items',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    }
  }

  Cart.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true, // one cart per user
      references: {
        model: 'Users',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'Cart',
    tableName: 'carts',
    indexes: [
      { unique: true, fields: ['userId'] }
    ]
  });

  return Cart;
};