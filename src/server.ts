import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectMongo } from "./config/mongo";

import reviewRoutes from "./routes/review.routes";
import gameRoutes from "./routes/game.routes";
import authRoutes from "./routes/auth.routes"
import scoreRoutes from "./routes/score.routes";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use("/reviews", reviewRoutes);
app.use("/games", gameRoutes);
app.use("/auth", authRoutes);
app.use("/scores", scoreRoutes);

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