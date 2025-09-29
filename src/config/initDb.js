import db from "../models/index.js";

// In production we rely on migrations. Avoid sync() which can create tables
// in unpredictable order leading to missing FK parents. Provide a DEV flag
// to optionally allow sync when explicitly enabled.
const initDb = async () => {
  try {
    await db.sequelize.authenticate();
    console.log("✅ Database connected!");

    if (process.env.USE_DB_SYNC === 'true') {
      console.warn("⚠️ USE_DB_SYNC=true detected – running sequelize.sync(). This is not recommended in production.");
      await db.sequelize.sync();
      console.log("✅ Models synced via sequelize.sync()");
    } else {
      console.log("ℹ️ Skipping sequelize.sync(); run migrations with sequelize-cli.");
    }
  } catch (err) {
    console.error("❌ DB Connection Error:", err);
  }
};
export default initDb;