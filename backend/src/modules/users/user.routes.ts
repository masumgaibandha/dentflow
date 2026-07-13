import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth";
import { requireRole } from "../../middleware/requireRole";
import { create, list, updateStatus } from "./user.controller";

export const userRouter = Router();

userRouter.use(requireAuth, requireRole("admin"));

userRouter.get("/", list);
userRouter.post("/", create);
userRouter.patch("/:id/status", updateStatus);
