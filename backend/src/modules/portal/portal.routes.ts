import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth";
import { requireRole } from "../../middleware/requireRole";
import { getAppointments, getInvoice, getMe, listInvoices } from "./portal.controller";

export const portalRouter = Router();

portalRouter.use(requireAuth, requireRole("patient"));

portalRouter.get("/me", getMe);
portalRouter.get("/appointments", getAppointments);
portalRouter.get("/invoices", listInvoices);
portalRouter.get("/invoices/:id", getInvoice);
