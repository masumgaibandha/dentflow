import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth";
import { requireRole } from "../../middleware/requireRole";
import { cancel, create, getOne, list, remove, update } from "./appointment.controller";

export const appointmentRouter = Router();

appointmentRouter.use(requireAuth, requireRole("admin"));

appointmentRouter.get("/", list);
appointmentRouter.get("/:id", getOne);
appointmentRouter.post("/", create);
appointmentRouter.patch("/:id", update);
appointmentRouter.patch("/:id/cancel", cancel);
appointmentRouter.delete("/:id", remove);
