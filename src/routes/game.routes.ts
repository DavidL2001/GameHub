import { Router } from "express";
import * as gameController from "../controllers/game.controller";

const router = Router();

//Game CRUD
router.post("/", gameController.createGame);
router.get("/", gameController.getAllGames);
router.get("/:id", gameController.getGameById);
router.put("/:id", gameController.updateGame);
router.delete("/:id", gameController.deleteGame);

export default router;

//Alla dessa testade i Insomnia och funkar som det ska