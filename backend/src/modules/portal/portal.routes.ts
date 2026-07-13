import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth";
import { requireRole } from "../../middleware/requireRole";
import {
  createPaymentIntent,
  getAppointments,
  getInvoice,
  getMe,
  listInvoices,
  verifyPayment,
} from "./portal.controller";

export const portalRouter = Router();

portalRouter.use(requireAuth, requireRole("patient"));

portalRouter.get("/me", getMe);
portalRouter.get("/appointments", getAppointments);
portalRouter.get("/invoices", listInvoices);
portalRouter.get("/invoices/:id", getInvoice);
portalRouter.post("/invoices/:id/payment-intent", createPaymentIntent);
portalRouter.post("/invoices/:id/verify-payment", verifyPayment);
