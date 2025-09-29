import express from "express";
import dotenv from "dotenv";
import initDb from "./config/initDb.js";
import router from "./routes/index.js";
import cors from "cors";


dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json());
app.use(cors());


app.get("/", (req, res) => {
  res.send("Hello World!");
});



app.use("/api",router);



app.listen(PORT, async () => {
  await initDb();
  console.log(`Server is running on http://localhost:${PORT}`);
});

