import db from "../models/index.js";


const initDb = async () => {
  try {
    await db.sequelize.authenticate();
    console.log("✅ Database connected!");
    await db.sequelize.sync({ sync: true }); // or { force: true } in dev
    console.log("✅ Models synced!");
  } catch (err) {
    console.error("❌ DB Connection Error:", err);
  }
};
export default initDb;