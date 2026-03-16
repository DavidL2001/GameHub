import { Request, Response } from "express";
import * as gameService from "../services/game.service";

//1.
export const createGame = async (req: Request, res: Response) => {
  try {
    const { name, description, max_score } = req.body;
    const result = await gameService.createGame(
      name,
      description,
      max_score
    );
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to create game" });
  }
};
//2.
export const getAllGames = async (req: Request, res: Response) => {
  try {
    const games = await gameService.getAllGames();
    res.json(games);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch games" });
  }
};
//3.
export const getGameById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const game = await gameService.getGameById(id);
    res.json(game);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch game" });
  }
};
//4.
export const updateGame = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { name, description, max_score } = req.body;
    const result = await gameService.updateGame(
      id,
      name,
      description,
      max_score
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to update game" });
  }
};
//5.
export const deleteGame = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const result = await gameService.deleteGame(id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to delete game" });
  }
};