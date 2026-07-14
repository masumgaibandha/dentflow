import { Router } from "express";
import { create } from "./contact.controller";

// Deliberately public - no requireAuth. A prospective clinic or patient
// contacting DentFlow from the marketing site has no account yet by
// definition.
export const contactRouter = Router();

contactRouter.post("/", create);
