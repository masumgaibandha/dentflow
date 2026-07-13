import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth";
import { requireRole } from "../../middleware/requireRole";
import { create, getOne, list, markPaid, remove, update, voidOne } from "./invoice.controller";

export const invoiceRouter = Router();

invoiceRouter.use(requireAuth, requireRole("admin"));

invoiceRouter.get("/", list);
invoiceRouter.get("/:id", getOne);
invoiceRouter.post("/", create);
invoiceRouter.patch("/:id", update);
invoiceRouter.patch("/:id/mark-paid", markPaid);
invoiceRouter.patch("/:id/void", voidOne);
invoiceRouter.delete("/:id", remove);
