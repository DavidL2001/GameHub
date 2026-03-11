import { Router } from "express";
import * as reviewController from "../controllers/review.controller";

const router = Router();

//Review CRUD
router.post("/", reviewController.createReview);
router.get("/", reviewController.getAllReviews);
router.get("/:id", reviewController.getReviewById);
router.put("/:id", reviewController.updateReview);
router.delete("/:id", reviewController.deleteReview);

router.get("/game/:id", reviewController.getReviewsByGame);

export default router;

//Alla dessa testade i Insomnia och funkar som det ska