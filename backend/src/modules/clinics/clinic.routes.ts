import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth";
import { requireRole } from "../../middleware/requireRole";
import { getMe, updateMe } from "./clinic.controller";

export const clinicRouter = Router();

clinicRouter.use(requireAuth, requireRole("admin"));

clinicRouter.get("/me", getMe);
clinicRouter.patch("/me", updateMe);
