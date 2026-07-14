import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth";
import { requireRole } from "../../middleware/requireRole";
import {
  amend,
  create,
  finalize,
  getOne,
  list,
  remove,
  update,
  updateVisibility,
} from "./medical-record.controller";

export const medicalRecordRouter = Router();

// Patient-role users must receive 403 from every one of these endpoints - no
// patient-portal medical-record access exists in this milestone.
medicalRecordRouter.use(requireAuth, requireRole("admin", "staff"));

medicalRecordRouter.get("/", list);
medicalRecordRouter.get("/:id", getOne);
medicalRecordRouter.post("/", create);
medicalRecordRouter.patch("/:id", update);
medicalRecordRouter.delete("/:id", remove);
medicalRecordRouter.post("/:id/finalize", finalize);
medicalRecordRouter.patch("/:id/visibility", updateVisibility);
medicalRecordRouter.post("/:id/amendments", amend);
