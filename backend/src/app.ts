import cors from "cors";
import express, { type Express } from "express";
import { env } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";
import { notFoundHandler } from "./middleware/notFound";
import { appointmentRouter } from "./modules/appointments/appointment.routes";
import { authRouter } from "./modules/auth/auth.routes";
import { dentistRouter } from "./modules/dentists/dentist.routes";
import { patientRouter } from "./modules/patients/patient.routes";
import { treatmentRouter } from "./modules/treatments/treatment.routes";

export function createApp(): Express {
  const app = express();

  app.use(cors({ origin: env.CORS_ORIGIN }));
  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/treatments", treatmentRouter);
  app.use("/api/patients", patientRouter);
  app.use("/api/dentists", dentistRouter);
  app.use("/api/appointments", appointmentRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
