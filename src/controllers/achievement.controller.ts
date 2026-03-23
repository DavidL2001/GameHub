import { Request, Response } from "express";
import * as achievementService from "../services/achievement.service";
import { AuthRequest } from "../types/authRequest";

//1. Secured - Hämta achievements för en användare till Dashboard (måste vara inloggad)
export const getMyAchievements = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user.id;
    const achievements = await achievementService.getAchievementsByUser(userId);
    res.json(achievements);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch achievements"
    });
  }
};

//2. Secured - Måste vara inloggad för att låsa upp achievements
export const unlockAchievement = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user.id;
    const { achievement_id } = req.body;
    await achievementService.unlockAchievement(userId, achievement_id);
    res.status(200).json({
      message: "Achievement unlocked"
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to unlock achievement"
    });
  }
};