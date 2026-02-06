"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { getBookings, approveBooking, cancelBooking } from "@/lib/api";
import type { Booking } from "@/types/booking";

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function StatusBadge({ status }: { status: Booking["status"] }) {
  const base =
    "px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1";

  if (status === "approved") return <span className={`${base} bg-green-100 text-green-700`}>✅ Approved</span>;
  if (status === "cancelled") return <span className={`${base} bg-red-100 text-red-700`}>❌ Cancelled</span>;
  return <span className={`${base} bg-yellow-100 text-yellow-700`}>⏳ Pending</span>;
}

export default function AdminPage() {
  const router = useRouter();

  // ✅ Cek role langsung tanpa setState
  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    if (storedRole !== "admin") {
      toast.error("Access denied!");
      router.push("/");
    }
  }, [router]);

  const { data, refetch, isLoading } = useQuery<Booking[]>({
    queryKey: ["bookings"],
    queryFn: getBookings,
  });

  const approveMutation = useMutation<void, Error, number>({
    mutationFn: approveBooking,
    onSuccess: () => {
      toast.success("Booking approved!");
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const cancelMutation = useMutation<void, Error, number>({
    mutationFn: cancelBooking,
    onSuccess: () => {
      toast.success("Booking cancelled!");
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <main className="min-h-screen bg-indigo-50 p-10">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">Admin Dashboard</h1>

      {isLoading && <p className="text-gray-500 animate-pulse">Loading bookings...</p>}
      {!isLoading && data?.length === 0 && <p className="text-gray-500">No bookings yet.</p>}

      <div className="space-y-4">
        {data?.map((b) => (
          <div key={b.id} className="p-5 bg-white rounded-2xl shadow flex justify-between items-center border border-gray-200">
            <div>
              <p className="font-semibold text-gray-800">Resource #{b.resource_id}</p>
              <p className="text-sm text-gray-500">{formatDate(b.start_time)} → {formatDate(b.end_time)}</p>
              <div className="mt-2"><StatusBadge status={b.status} /></div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => approveMutation.mutate(b.id)}
                disabled={b.status !== "pending"}
                className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 disabled:opacity-40"
              >
                Approve
              </button>

              <button
                onClick={() => cancelMutation.mutate(b.id)}
                disabled={b.status === "cancelled"}
                className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:opacity-40"
              >
                Cancel
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
