import { Router } from "express";
import * as achievementController from "../controllers/achievement.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

//1. Secured - Hämta achievements till Dashboard
router.get("/my", authenticateToken, achievementController.getMyAchievements);
//2 Secured - Lås upp achievements
router.post("/unlock", authenticateToken, achievementController.unlockAchievement);

export default router;

//Testad i Insomnia och funkar som det ska
/* Källa/inspiration för achievements: https://stackoverflow.com/questions/4192653/best-way-to-code-achievements-system */