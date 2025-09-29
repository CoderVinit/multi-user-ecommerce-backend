'use strict';

import fs from 'fs';
import path from 'path';
import Sequelize from 'sequelize';
import process from 'process';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const configPath = path.join(__dirname, '/../config/config.json');
const config = JSON.parse(readFileSync(configPath, 'utf8'))[env];
const db = {};

// Allow environment variables to override JSON config (useful inside containers)
const dbName = process.env.DB_NAME || process.env.MYSQL_DB || config.database;
const dbUser = process.env.DB_USER || process.env.MYSQL_USER || config.username;
const dbPass = process.env.DB_PASS || process.env.MYSQL_PASSWORD || config.password;
const dbHost = process.env.DB_HOST || process.env.MYSQL_HOST || config.host;
const dbPort = Number(process.env.DB_PORT || process.env.MYSQL_PORT || config.port || 3306);

let sequelize;
if (config.use_env_variable && process.env[config.use_env_variable]) {
  sequelize = new Sequelize(process.env[config.use_env_variable], { ...config, host: dbHost, port: dbPort });
} else {
  sequelize = new Sequelize(dbName, dbUser, dbPass, { ...config, host: dbHost, port: dbPort });
}

// For now, we'll manually import models since there are model files
// When you create model files, make sure they export as ES modules like:
// export default (sequelize, DataTypes) => { ... }

// Import User model
import UserModel from './user.js';
const User = UserModel(sequelize, Sequelize.DataTypes);
db[User.name] = User;

// Import VendorProfile model
import VendorProfileModel from './vendorprofile.js';
const VendorProfile = VendorProfileModel(sequelize, Sequelize.DataTypes);
db[VendorProfile.name] = VendorProfile;

// Import Category model
import CategoryModel from './category.js';
const Category = CategoryModel(sequelize, Sequelize.DataTypes);
db[Category.name] = Category;

// Import Product model
import ProductModel from './product.js';
const Product = ProductModel(sequelize, Sequelize.DataTypes);
db[Product.name] = Product;

// Import Cart model
import CartModel from './cart.js';
const Cart = CartModel(sequelize, Sequelize.DataTypes);
db[Cart.name] = Cart;

// Import CartItem model
import CartItemModel from './cartitem.js';
const CartItem = CartItemModel(sequelize, Sequelize.DataTypes);
db[CartItem.name] = CartItem;

// Import Order model
import OrderModel from './order.js';
const Order = OrderModel(sequelize, Sequelize.DataTypes);
db[Order.name] = Order;

// Import OrderItem model
import OrderItemModel from './orderitem.js';
const OrderItem = OrderItemModel(sequelize, Sequelize.DataTypes);
db[OrderItem.name] = OrderItem;

// Import PaymentIntent model
import PaymentIntentModel from './paymentintent.js';
const PaymentIntent = PaymentIntentModel(sequelize, Sequelize.DataTypes);
db[PaymentIntent.name] = PaymentIntent;

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
