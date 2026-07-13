import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth";
import { requireRole } from "../../middleware/requireRole";
import { create, getOne, list, remove, update } from "./patient.controller";

export const patientRouter = Router();

patientRouter.use(requireAuth, requireRole("admin"));

patientRouter.get("/", list);
patientRouter.get("/:id", getOne);
patientRouter.post("/", create);
patientRouter.patch("/:id", update);
patientRouter.delete("/:id", remove);
