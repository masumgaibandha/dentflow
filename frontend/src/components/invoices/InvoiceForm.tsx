"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { PatientSelect } from "@/components/appointments/PatientSelect";
import { AppointmentSelect } from "@/components/invoices/AppointmentSelect";
import { FormField, inputClasses } from "@/components/ui/FormField";
import type { Appointment } from "@/lib/api/appointmentsApi";
import { invoiceFormSchema, type InvoiceFormValues } from "@/validators/invoice";

export interface InvoiceFormDefaults extends Partial<InvoiceFormValues> {
  patientLabel?: string;
  appointmentLabel?: string;
}

const DEFAULT_LINE_ITEM = { title: "", quantity: 1, unitPrice: 0 };

export function InvoiceForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  submitLabel,
}: {
  defaultValues?: InvoiceFormDefaults;
  onSubmit: (values: InvoiceFormValues) => void;
  isSubmitting: boolean;
  submitLabel: string;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: defaultValues ?? { lineItems: [DEFAULT_LINE_ITEM] },
  });

  const { fields, append, remove, update } = useFieldArray({ control, name: "lineItems" });

  const [patientLabel, setPatientLabel] = useState(defaultValues?.patientLabel ?? "");
  const [appointmentLabel, setAppointmentLabel] = useState(defaultValues?.appointmentLabel ?? "");

  const patientId = watch("patientId");
  const lineItems = watch("lineItems");

  const previewTotal = lineItems.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
    0,
  );

  function handleAppointmentSelect(appointment: Appointment) {
    setValue("appointmentId", appointment.id, { shouldValidate: true });
    setAppointmentLabel(new Date(appointment.startTime).toLocaleString());

    if (!appointment.treatment) return;

    const prefillItem = {
      title: appointment.treatment.title ?? "",
      quantity: 1,
      unitPrice: appointment.treatment.price ?? 0,
    };

    // If the only row is still the untouched blank default, replace it rather
    // than appending a second row alongside an empty (invalid) one.
    const isOnlyBlankRow = fields.length === 1 && !lineItems[0]?.title;
    if (isOnlyBlankRow) {
      update(0, prefillItem);
    } else {
      append(prefillItem);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <FormField label="Patient" error={errors.patientId?.message}>
        <PatientSelect
          selectedLabel={patientLabel}
          onSelect={(patient) => {
            setValue("patientId", patient.id, { shouldValidate: true });
            setPatientLabel(patient.name);
            // Changing patient invalidates any previously linked appointment.
            setValue("appointmentId", "");
            setAppointmentLabel("");
          }}
        />
      </FormField>

      <FormField label="Linked appointment (optional)" error={errors.appointmentId?.message}>
        <AppointmentSelect
          patientId={patientId}
          selectedLabel={appointmentLabel}
          onSelect={handleAppointmentSelect}
          onClear={() => {
            setValue("appointmentId", "");
            setAppointmentLabel("");
          }}
        />
      </FormField>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Line items</span>
        {fields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-[1fr_70px_100px_auto] items-end gap-2">
            <FormField
              label={index === 0 ? "Title" : ""}
              error={errors.lineItems?.[index]?.title?.message}
            >
              <input {...register(`lineItems.${index}.title` as const)} className={inputClasses} />
            </FormField>
            <FormField
              label={index === 0 ? "Qty" : ""}
              error={errors.lineItems?.[index]?.quantity?.message}
            >
              <input
                type="number"
                min={1}
                step={1}
                {...register(`lineItems.${index}.quantity` as const)}
                className={inputClasses}
              />
            </FormField>
            <FormField
              label={index === 0 ? "Unit price ($)" : ""}
              error={errors.lineItems?.[index]?.unitPrice?.message}
            >
              <input
                type="number"
                min={0}
                step="0.01"
                {...register(`lineItems.${index}.unitPrice` as const)}
                className={inputClasses}
              />
            </FormField>
            <button
              type="button"
              onClick={() => remove(index)}
              disabled={fields.length === 1}
              className="rounded-md border border-red-300 px-2.5 py-2 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-40 dark:border-red-900 dark:hover:bg-red-950"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => append(DEFAULT_LINE_ITEM)}
          className="self-start rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          Add line item
        </button>
      </div>

      <p className="text-right text-sm text-zinc-600 dark:text-zinc-400">
        Preview total: <span className="font-medium">${previewTotal.toFixed(2)}</span>{" "}
        <span className="text-xs">(final total is calculated on save)</span>
      </p>

      <FormField label="Notes" error={errors.notes?.message}>
        <textarea {...register("notes")} rows={3} className={inputClasses} />
      </FormField>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {isSubmitting ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
