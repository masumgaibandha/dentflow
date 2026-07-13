import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth";
import { requireRole } from "../../middleware/requireRole";
import { create, createPortalAccountHandler, getOne, list, remove, update } from "./patient.controller";

export const patientRouter = Router();

patientRouter.use(requireAuth, requireRole("admin", "staff"));

patientRouter.get("/", list);
patientRouter.get("/:id", getOne);
patientRouter.post("/", create);
patientRouter.patch("/:id", update);
patientRouter.delete("/:id", remove);
// Narrower than the router-level admin+staff gate above - issuing portal
// login credentials is admin-only, same tier as staff account creation.
patientRouter.post("/:id/portal-account", requireRole("admin"), createPortalAccountHandler);
