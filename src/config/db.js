import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();



const sequelize = new Sequelize(MYSQL_DB, MYSQL_USER, MYSQL_PASSWORD, {
  host: MYSQL_HOST,
  port: MYSQL_PORT,
  dialect: "mysql",
  logging: false
});


export default sequelize;