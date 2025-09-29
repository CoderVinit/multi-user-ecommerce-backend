import { Sequelize } from "sequelize";




const DB_USER = process.env.MYSQL_USER;
const DB_PASSWORD = process.env.MYSQL_PASSWORD;
const DB_NAME = process.env.MYSQL_DB;
const DB_HOST = process.env.MYSQL_HOST;
const DB_PORT = process.env.MYSQL_PORT;


const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: "mysql",
  logging: false
});


export default sequelize;