import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth";
import { requireRole } from "../../middleware/requireRole";
import {
  create,
  getPublicTreatment,
  listAdminTreatments,
  listPublicTreatments,
  remove,
  update,
} from "./treatment.controller";

export const treatmentRouter = Router();

treatmentRouter.get("/admin", requireAuth, requireRole("admin", "staff"), listAdminTreatments);
treatmentRouter.get("/", listPublicTreatments);
treatmentRouter.get("/:id", getPublicTreatment);
treatmentRouter.post("/", requireAuth, requireRole("admin"), create);
treatmentRouter.patch("/:id", requireAuth, requireRole("admin"), update);
treatmentRouter.delete("/:id", requireAuth, requireRole("admin"), remove);
