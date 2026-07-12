import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth";
import { login, me, register } from "./auth.controller";

export const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.get("/me", requireAuth, me);
