'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class VendorProfile extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // VendorProfile belongs to User
      VendorProfile.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
    }
  }
  VendorProfile.init({
    id: { 
      type: DataTypes.INTEGER, 
      autoIncrement: true, 
      primaryKey: true 
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        // Reference the actual table name defined in User model (tableName: 'users')
        model: 'users',
        key: 'id'
      }
    },
    shopName: { 
      type: DataTypes.STRING, 
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 100]
      }
    },
    gstin: { 
      type: DataTypes.STRING, 
      allowNull: true,
      validate: {
        len: [10, 100] // GSTIN is exactly 10 characters
      }
    },
    address: { 
      type: DataTypes.TEXT, 
      allowNull: true 
    }
  }, {
    sequelize,
    modelName: 'VendorProfile',
    tableName: 'vendor_profiles'
  });
  return VendorProfile;
};