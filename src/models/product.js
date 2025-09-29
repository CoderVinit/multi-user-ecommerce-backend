'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Product belongs to a vendor (user with vendor role)
      Product.belongsTo(models.User, {
        foreignKey: 'vendorId',
        as: 'vendor'
      });
      
      // Product belongs to a category
      Product.belongsTo(models.Category, {
        foreignKey: 'categoryId',
        as: 'category'
      });

      // Product can appear in many cart items
      Product.hasMany(models.CartItem, {
        foreignKey: 'productId',
        as: 'cartItems'
      });
    }
  }
  Product.init({
    id: { 
      type: DataTypes.INTEGER, 
      autoIncrement: true, 
      primaryKey: true 
    },
    name: { 
      type: DataTypes.STRING, 
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 255]
      }
    },
    description: { 
      type: DataTypes.TEXT,
      allowNull: true
    },
    price: { 
      type: DataTypes.DECIMAL(10, 2), // Better precision for currency
      allowNull: false,
      validate: {
        min: 0,
        isDecimal: true
      }
    },
    stock: { 
      type: DataTypes.INTEGER, 
      allowNull: false, 
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    vendorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'categories',
        key: 'id'
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'Product',
    tableName: 'products',
    indexes: [
      {
        fields: ['vendorId']
      },
      {
        fields: ['categoryId']
      },
      {
        fields: ['name']
      },
      {
        fields: ['isActive']
      }
    ]
  });
  return Product;
};