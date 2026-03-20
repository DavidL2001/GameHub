import { Router } from "express";
import * as achievementController from "../controllers/achievement.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

//1. Secured
router.get("/my", authenticateToken, achievementController.getMyAchievements);

export default router;

//Testad i Insomnia och funkar som det ska