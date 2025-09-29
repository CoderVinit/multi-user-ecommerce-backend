'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('vendor_profiles', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      shopName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      gstin: {
        type: Sequelize.STRING(10),
        allowNull: true
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Add index on userId for better performance
    await queryInterface.addIndex('vendor_profiles', ['userId'], {
      unique: true,
      name: 'vendor_profiles_user_id_unique_idx'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('vendor_profiles');
  }
};