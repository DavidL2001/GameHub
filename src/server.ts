import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import reviewRoutes from "./routes/review.routes";
import { connectMongo } from "./config/mongo";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/reviews", reviewRoutes);

app.get("/", (req, res) => {
  res.send("GameHub API running");
});

const startServer = async () => {

  await connectMongo();

  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();