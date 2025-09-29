import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(
  process.env.MYSQL_DB,
  process.env.MYSQL_USER,
  process.env.MYSQL_PASSWORD,
  {
    host: "db",   // must be "db" in docker
    port: Number(process.env.MYSQL_PORT) || 3306,
    dialect: "mysql",
    logging: false,
  }
);

export default sequelize;
