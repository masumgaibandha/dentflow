"use client";

import { useMe } from "@/hooks/useAuth";

export default function DashboardPage() {
  const { data } = useMe();

  return (
    <div>
      <h1 className="text-2xl font-semibold">
        Welcome back{data ? `, ${data.user.name}` : ""}
      </h1>
      <p className="mt-1 text-zinc-600 dark:text-zinc-400">
        You&apos;re signed in as {data?.user.role} at {data?.clinic.name}. Appointment
        management and reporting land in upcoming milestones.
      </p>
    </div>
  );
}
