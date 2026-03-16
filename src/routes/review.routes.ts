import { Router } from "express";
import * as reviewController from "../controllers/review.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

//Review CRUD
router.post("/", authenticateToken, reviewController.createReview);
router.get("/", reviewController.getAllReviews);

router.get("/game/:id", reviewController.getReviewsByGame);

router.get("/:id", reviewController.getReviewById);
router.put("/:id", reviewController.updateReview);
router.delete("/:id", reviewController.deleteReview);


export default router;

//Alla dessa testade i Insomnia och funkar som det ska