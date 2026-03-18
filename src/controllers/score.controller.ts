import { Request, Response } from "express";
import * as scoreService from "../services/score.service";
import { AuthRequest } from "../types/authRequest";

//1. Secured - Måste vara inloggad för att kunna spara score
export const createScore = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user.id;
    const { game_id, score } = req.body;
    const result = await scoreService.createScore(
      userId,
      game_id,
      score
    );
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create score"
    });

  }
};
//2.
export const getAllScores = async (req: Request, res: Response) => {
  try {
    const scores = await scoreService.getAllScores();
    res.json(scores);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch scores" });
  }
};
//3.
export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    const gameId = Number(req.params.gameId);
    const leaderboard = await scoreService.getLeaderboardByGame(gameId);
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch leaderboard" });
  }
};
//4.
export const deleteScore = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const result = await scoreService.deleteScore(id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to delete score" });
  }
};