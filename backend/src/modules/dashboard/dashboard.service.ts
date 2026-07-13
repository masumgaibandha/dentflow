import { Types } from "mongoose";
import { Appointment } from "../../models/Appointment";
import { Clinic } from "../../models/Clinic";
import { Dentist } from "../../models/Dentist";
import { Invoice } from "../../models/Invoice";
import { Patient } from "../../models/Patient";
import { Treatment } from "../../models/Treatment";
import { DEFAULT_TIMEZONE, getDayRange, getMonthRange, toTimezoneDateString } from "../../utils/timezone";

const CHART_DAYS = 7;

async function resolveClinicTimezone(clinicId: string): Promise<string> {
  const clinic = await Clinic.findById(clinicId).select("timezone");
  return clinic?.timezone || DEFAULT_TIMEZONE;
}

async function getPaidRevenueByDay(clinicId: string, timezone: string, now: Date) {
  const rangeStart = new Date(now.getTime() - (CHART_DAYS - 1) * 24 * 60 * 60 * 1000);
  const { start: chartStart } = getDayRange(rangeStart, timezone);
  const { end: chartEnd } = getDayRange(now, timezone);

  const buckets = await Invoice.aggregate<{ _id: string; totalCents: number }>([
    {
      $match: {
        clinicId: new Types.ObjectId(clinicId),
        status: "paid",
        "payment.paidAt": { $gte: chartStart, $lt: chartEnd },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$payment.paidAt", timezone } },
        totalCents: { $sum: "$totalCents" },
      },
    },
  ]);

  const byDate = new Map(buckets.map((bucket) => [bucket._id, bucket.totalCents]));

  // Zero-fill every day in the window so the chart never has missing dates,
  // even when there was no paid revenue that day.
  const days: { date: string; totalCents: number }[] = [];
  const todayDateStr = toTimezoneDateString(now, timezone);
  const anchor = new Date(`${todayDateStr}T12:00:00.000Z`); // noon UTC avoids DST-edge date-arithmetic bugs
  for (let i = CHART_DAYS - 1; i >= 0; i -= 1) {
    const dayAnchor = new Date(anchor);
    dayAnchor.setUTCDate(dayAnchor.getUTCDate() - i);
    const dateStr = toTimezoneDateString(dayAnchor, "UTC");
    days.push({ date: dateStr, totalCents: byDate.get(dateStr) ?? 0 });
  }

  return days;
}

export async function getDashboardSummary(clinicId: string) {
  const timezone = await resolveClinicTimezone(clinicId);
  const now = new Date();
  const clinicObjectId = new Types.ObjectId(clinicId);

  const { start: startOfToday, end: endOfToday } = getDayRange(now, timezone);
  const { start: startOfMonth, end: startOfNextMonth } = getMonthRange(now, timezone);

  const [
    patientCount,
    dentistCount,
    treatmentCount,
    todayAppointmentCount,
    upcomingAppointmentCount,
    unpaidAgg,
    paidRevenueAgg,
    chartDays,
  ] = await Promise.all([
    Patient.countDocuments({ clinicId }),
    Dentist.countDocuments({ clinicId }),
    Treatment.countDocuments({ clinicId }),
    Appointment.countDocuments({
      clinicId,
      status: { $ne: "cancelled" },
      startTime: { $gte: startOfToday, $lt: endOfToday },
    }),
    Appointment.countDocuments({
      clinicId,
      status: "scheduled",
      startTime: { $gt: now },
    }),
    Invoice.aggregate<{ count: number; totalCents: number }>([
      { $match: { clinicId: clinicObjectId, status: "unpaid" } },
      { $group: { _id: null, count: { $sum: 1 }, totalCents: { $sum: "$totalCents" } } },
    ]),
    Invoice.aggregate<{ totalCents: number }>([
      {
        $match: {
          clinicId: clinicObjectId,
          status: "paid",
          "payment.paidAt": { $gte: startOfMonth, $lt: startOfNextMonth },
        },
      },
      { $group: { _id: null, totalCents: { $sum: "$totalCents" } } },
    ]),
    getPaidRevenueByDay(clinicId, timezone, now),
  ]);

  return {
    timezone,
    totals: {
      patients: patientCount,
      dentists: dentistCount,
      activeTreatments: treatmentCount,
    },
    appointments: {
      today: todayAppointmentCount,
      upcoming: upcomingAppointmentCount,
    },
    invoices: {
      unpaidCount: unpaidAgg[0]?.count ?? 0,
      outstandingCents: unpaidAgg[0]?.totalCents ?? 0,
      paidRevenueThisMonthCents: paidRevenueAgg[0]?.totalCents ?? 0,
    },
    chart: {
      metric: "paidRevenueCents" as const,
      label: `Paid revenue by day (last ${CHART_DAYS} days)`,
      days: chartDays,
    },
  };
}
