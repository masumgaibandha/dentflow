import { formatCents } from "@/lib/api/invoicesApi";
import type { PortalInvoiceDetail } from "@/lib/api/portalApi";

// Dedicated read-only component - no "Pay now", no PDF/download, no
// mutation hooks. Purely displays what the server already computed.

const STATUS_LABELS: Record<PortalInvoiceDetail["status"], string> = {
  unpaid: "Unpaid",
  paid: "Paid",
  void: "Void",
};

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function PortalInvoiceDetails({ invoice }: { invoice: PortalInvoiceDetail }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="font-medium">{invoice.invoiceNumber}</span>
        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          {STATUS_LABELS[invoice.status]}
        </span>
      </div>

      <div className="overflow-x-auto rounded-md border border-zinc-200 dark:border-zinc-800">
        <table className="w-full min-w-[420px] text-left text-sm">
          <caption className="sr-only">Line items for invoice {invoice.invoiceNumber}</caption>
          <thead className="bg-zinc-50 text-xs uppercase text-zinc-500 dark:bg-zinc-900">
            <tr>
              <th scope="col" className="p-2">
                Title
              </th>
              <th scope="col" className="p-2">
                Qty
              </th>
              <th scope="col" className="p-2">
                Unit price
              </th>
              <th scope="col" className="p-2">
                Line total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {invoice.lineItems.map((item, index) => (
              <tr key={index}>
                <td className="p-2">{item.title}</td>
                <td className="p-2">{item.quantity}</td>
                <td className="p-2">{formatCents(item.unitPriceCents)}</td>
                <td className="p-2">{formatCents(item.lineTotalCents)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <dl className="flex flex-col gap-1 text-sm">
        <div className="flex justify-between">
          <dt className="text-zinc-500 dark:text-zinc-400">Subtotal</dt>
          <dd>{formatCents(invoice.subtotalCents)}</dd>
        </div>
        <div className="flex justify-between font-medium">
          <dt>Total</dt>
          <dd>{formatCents(invoice.totalCents)}</dd>
        </div>
      </dl>

      {invoice.payment && (
        <div className="rounded-md border border-zinc-200 p-3 text-sm dark:border-zinc-800">
          <p className="font-medium text-zinc-700 dark:text-zinc-300">Payment</p>
          <dl className="mt-2 flex flex-col gap-1">
            <div className="flex justify-between">
              <dt className="text-zinc-500 dark:text-zinc-400">Method</dt>
              <dd className="capitalize">{invoice.payment.method.replace("_", " ")}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500 dark:text-zinc-400">Paid on</dt>
              <dd>{formatDateTime(invoice.payment.paidAt)}</dd>
            </div>
            {invoice.payment.reference && (
              <div className="flex justify-between">
                <dt className="text-zinc-500 dark:text-zinc-400">Reference</dt>
                <dd>{invoice.payment.reference}</dd>
              </div>
            )}
          </dl>
        </div>
      )}
    </div>
  );
}
