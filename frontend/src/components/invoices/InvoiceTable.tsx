import { Skeleton } from "@/components/ui/Skeleton";
import { formatCents, type Invoice } from "@/lib/api/invoicesApi";

function InvoiceRowSkeleton() {
  return (
    <tr>
      <td className="p-3">
        <Skeleton className="h-4 w-24" />
      </td>
      <td className="p-3">
        <Skeleton className="h-4 w-32" />
      </td>
      <td className="p-3">
        <Skeleton className="h-4 w-20" />
      </td>
      <td className="p-3">
        <Skeleton className="h-4 w-20" />
      </td>
      <td className="p-3">
        <Skeleton className="h-4 w-28" />
      </td>
    </tr>
  );
}

const STATUS_BADGE_CLASSES: Record<Invoice["status"], string> = {
  unpaid: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  paid: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
  void: "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};

export function InvoiceTable({
  invoices,
  isLoading,
  onEdit,
  onMarkPaid,
  onVoid,
  onDelete,
}: {
  invoices: Invoice[];
  isLoading: boolean;
  onEdit: (invoice: Invoice) => void;
  onMarkPaid: (invoice: Invoice) => void;
  onVoid: (invoice: Invoice) => void;
  onDelete: (invoice: Invoice) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="bg-zinc-50 text-xs uppercase text-zinc-500 dark:bg-zinc-900">
          <tr>
            <th className="p-3">Invoice #</th>
            <th className="p-3">Patient</th>
            <th className="p-3">Total</th>
            <th className="p-3">Status</th>
            <th className="p-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {isLoading &&
            Array.from({ length: 5 }).map((_, i) => <InvoiceRowSkeleton key={i} />)}

          {!isLoading && invoices.length === 0 && (
            <tr>
              <td colSpan={5} className="p-6 text-center text-zinc-500">
                No invoices yet. Create your first one to get started.
              </td>
            </tr>
          )}

          {!isLoading &&
            invoices.map((invoice) => (
              <tr key={invoice.id}>
                <td className="p-3 font-medium">{invoice.invoiceNumber}</td>
                <td className="p-3">{invoice.patient.name ?? "—"}</td>
                <td className="p-3">{formatCents(invoice.totalCents)}</td>
                <td className="p-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE_CLASSES[invoice.status]}`}
                  >
                    {invoice.status}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex justify-end gap-2">
                    {invoice.status === "unpaid" && (
                      <>
                        <button
                          type="button"
                          onClick={() => onEdit(invoice)}
                          className="rounded-md border border-zinc-300 px-2.5 py-1 text-xs font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => onMarkPaid(invoice)}
                          className="rounded-md border border-green-300 px-2.5 py-1 text-xs font-medium text-green-700 hover:bg-green-50 dark:border-green-900 dark:text-green-400 dark:hover:bg-green-950"
                        >
                          Mark paid
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(invoice)}
                          className="rounded-md border border-red-300 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"
                        >
                          Delete
                        </button>
                      </>
                    )}
                    {invoice.status !== "void" && (
                      <button
                        type="button"
                        onClick={() => onVoid(invoice)}
                        className="rounded-md border border-amber-300 px-2.5 py-1 text-xs font-medium text-amber-700 hover:bg-amber-50 dark:border-amber-900 dark:text-amber-400 dark:hover:bg-amber-950"
                      >
                        Void
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
