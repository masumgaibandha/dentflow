import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth";
import { requireRole } from "../../middleware/requireRole";
import {
  cancelAppointment,
  createAppointment,
  createPaymentIntent,
  getAppointments,
  getAvailableSlots,
  getDentists,
  getInvoice,
  getMe,
  getTreatments,
  listInvoices,
  verifyPayment,
} from "./portal.controller";

export const portalRouter = Router();

portalRouter.use(requireAuth, requireRole("patient"));

portalRouter.get("/me", getMe);
portalRouter.get("/dentists", getDentists);
portalRouter.get("/treatments", getTreatments);
portalRouter.get("/appointments", getAppointments);
portalRouter.get("/available-slots", getAvailableSlots);
portalRouter.post("/appointments", createAppointment);
portalRouter.patch("/appointments/:id/cancel", cancelAppointment);
portalRouter.get("/invoices", listInvoices);
portalRouter.get("/invoices/:id", getInvoice);
portalRouter.post("/invoices/:id/payment-intent", createPaymentIntent);
portalRouter.post("/invoices/:id/verify-payment", verifyPayment);
