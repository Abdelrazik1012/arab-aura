// src/routes/hubRoutes.ts
import { Router } from "express";
import { getAllHubs, getHubPackages } from "../controllers/hubController";

const router = Router();

router.get("/", getAllHubs);
router.get("/:code/packages", getHubPackages);

export default router;
