import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth";
import { requireRole } from "../../middleware/requireRole";
import { getSummary } from "./dashboard.controller";

export const dashboardRouter = Router();

dashboardRouter.use(requireAuth, requireRole("admin"));

dashboardRouter.get("/summary", getSummary);
