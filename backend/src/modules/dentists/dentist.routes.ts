import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth";
import { requireRole } from "../../middleware/requireRole";
import { create, getOne, list, remove, update } from "./dentist.controller";

export const dentistRouter = Router();

dentistRouter.use(requireAuth, requireRole("admin"));

dentistRouter.get("/", list);
dentistRouter.get("/:id", getOne);
dentistRouter.post("/", create);
dentistRouter.patch("/:id", update);
dentistRouter.delete("/:id", remove);
