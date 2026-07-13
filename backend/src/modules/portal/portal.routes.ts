import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth";
import { requireRole } from "../../middleware/requireRole";
import { getMe } from "./portal.controller";

export const portalRouter = Router();

portalRouter.use(requireAuth, requireRole("patient"));

portalRouter.get("/me", getMe);
