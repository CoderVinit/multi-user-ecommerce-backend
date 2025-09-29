'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Category extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Self-referential associations
      // Category has many subcategories (children)
      Category.hasMany(models.Category, {
        foreignKey: 'parentId',
        as: 'subcategories'
      });
      
      // Category belongs to parent category
      Category.belongsTo(models.Category, {
        foreignKey: 'parentId',
        as: 'parentCategory'
      });
      
      // Category has many products
      Category.hasMany(models.Product, {
        foreignKey: 'categoryId',
        as: 'products'
      });
    }
  }
  Category.init({
    id: { 
      type: DataTypes.INTEGER, 
      autoIncrement: true, 
      primaryKey: true 
    },
    name: { 
      type: DataTypes.STRING, 
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [2, 100]
      }
    },
    parentId: { 
      type: DataTypes.INTEGER, 
      allowNull: true,
      references: {
        model: 'categories',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'Category',
    tableName: 'categories',
    indexes: [
      {
        unique: true,
        fields: ['name']
      },
      {
        fields: ['parentId']
      }
    ]
  });
  return Category;
};