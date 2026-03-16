import { Request, Response } from "express";
import * as reviewService from "../services/review.service";

//Definerar req.params.id - "!" (non null assertion operator) funkade inte
interface ReviewParams {
  id: string;
}

//1. Secured - Måste vara inloggad för att skapa en review
export const createReview = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { game_id, rating, comment } = req.body;
    const review = await reviewService.createReview(
      userId,
      game_id,
      rating,
      comment
    );
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create review"
    });
  }
};
//2. 
export const getAllReviews = async (req: Request, res: Response) => {
  try {
    const reviews = await reviewService.getAllReviews();
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
};
//3.
export const getReviewById = async (req: Request<ReviewParams>, res: Response) => {
  try {
    const review = await reviewService.getReviewById(req.params.id);
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: "Review not found" });
  }
};
//4.
export const updateReview = async (req: Request<ReviewParams>, res: Response) => {
  try {
    const review = await reviewService.updateReview(req.params.id, req.body);
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: "Failed to update review" });
  }
};
//5.
export const deleteReview = async (req: Request<ReviewParams>, res: Response) => {
  try {
    await reviewService.deleteReview(req.params.id);
    res.json({ message: "Review deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete review" });
  }
};
//6.
export const getReviewsByGame = async (req: Request, res: Response) => {
  try {
    const gameId = Number(req.params.id);
    const reviews = await reviewService.getReviewsByGameId(gameId);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch reviews for this game" });
  }
};