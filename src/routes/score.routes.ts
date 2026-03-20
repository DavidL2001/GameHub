import { Router } from "express";
import * as scoreController from "../controllers/score.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

//Mini CRUD till Scores/Leaderboard
router.post("/", authenticateToken, scoreController.createScore);
router.get("/", scoreController.getAllScores);
router.get("/my", authenticateToken, scoreController.getMyScores); //till Dashboard
router.get("/leaderboard/:gameId", scoreController.getLeaderboard);
router.delete("/:id", scoreController.deleteScore);

export default router;

//Alla dessa testade i Insomnia och funkar som det ska