import { Skeleton } from "@/components/ui/Skeleton";
import { formatCents } from "@/lib/api/invoicesApi";
import type { PortalInvoiceListItem } from "@/lib/api/portalApi";

// Dedicated read-only component for the patient portal - no mark-paid/void/
// delete/create controls and no mutation hooks imported. Not the admin
// InvoiceTable with actions hidden by CSS; this component never had the
// capability in the first place.

function PortalInvoiceRowSkeleton() {
  return (
    <tr>
      <td className="p-3">
        <Skeleton className="h-4 w-24" />
      </td>
      <td className="p-3">
        <Skeleton className="h-4 w-28" />
      </td>
      <td className="p-3">
        <Skeleton className="h-4 w-20" />
      </td>
      <td className="p-3">
        <Skeleton className="h-4 w-20" />
      </td>
      <td className="p-3">
        <Skeleton className="h-4 w-16" />
      </td>
    </tr>
  );
}

const STATUS_BADGE_CLASSES: Record<PortalInvoiceListItem["status"], string> = {
  unpaid: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  paid: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
  void: "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function PortalInvoicesTable({
  invoices,
  isLoading,
  onView,
}: {
  invoices: PortalInvoiceListItem[];
  isLoading: boolean;
  onView: (invoice: PortalInvoiceListItem) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
      <table className="w-full min-w-[560px] text-left text-sm">
        <caption className="sr-only">Your invoices</caption>
        <thead className="bg-zinc-50 text-xs uppercase text-zinc-500 dark:bg-zinc-900">
          <tr>
            <th scope="col" className="p-3">
              Invoice #
            </th>
            <th scope="col" className="p-3">
              Date
            </th>
            <th scope="col" className="p-3">
              Total
            </th>
            <th scope="col" className="p-3">
              Status
            </th>
            <th scope="col" className="p-3 text-right">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {isLoading && Array.from({ length: 4 }).map((_, i) => <PortalInvoiceRowSkeleton key={i} />)}

          {!isLoading && invoices.length === 0 && (
            <tr>
              <td colSpan={5} className="p-6 text-center text-zinc-500">
                No invoices yet
              </td>
            </tr>
          )}

          {!isLoading &&
            invoices.map((invoice) => (
              <tr key={invoice.id}>
                <td className="p-3 font-medium">{invoice.invoiceNumber}</td>
                <td className="p-3">{formatDate(invoice.createdAt)}</td>
                <td className="p-3">{formatCents(invoice.totalCents)}</td>
                <td className="p-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE_CLASSES[invoice.status]}`}
                  >
                    {invoice.status}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => onView(invoice)}
                      className="rounded-md border border-zinc-300 px-2.5 py-1 text-xs font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                    >
                      View details
                    </button>
                  </div>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
