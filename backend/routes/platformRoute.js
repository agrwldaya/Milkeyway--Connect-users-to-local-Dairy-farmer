import express from "express";
import { getPublicPlatformSettings } from "../controllers/adminController.js";

const PlatformRouter = express.Router();

// Public platform settings (no authentication required)
PlatformRouter.get("/settings", getPublicPlatformSettings);

export default PlatformRouter;
