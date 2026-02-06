"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import DateTimePicker from "@/components/DateTimePicker";

import {
  createBooking,
  getBookings,
  approveBooking,
  cancelBooking,
} from "@/lib/api";

import type {
  Booking,
  CreateBookingPayload,
  CreateBookingResponse,
} from "@/types/booking";

/* ============================
   HELPERS
============================ */

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function StatusBadge({ status }: { status: Booking["status"] }) {
  const base =
    "px-3 py-1 rounded-full text-xs font-bold tracking-wide flex items-center gap-1";

  if (status === "approved") {
    return (
      <span className={`${base} bg-green-100 text-green-700`}>
        Approved
      </span>
    );
  }

  if (status === "cancelled") {
    return (
      <span className={`${base} bg-red-100 text-red-700`}>
        Cancelled
      </span>
    );
  }

  return (
    <span className={`${base} bg-yellow-100 text-yellow-700`}>
      Pending
    </span>
  );
}

/* ============================
   PAGE
============================ */

export default function Home() {
  const router = useRouter();

  const [resourceId, setResourceId] = useState<number>(1);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [role, setRole] = useState<"admin" | "user" | null>(null);

  /* ============================
     AUTH CHECK
  ============================ */
useEffect(() => {
  const token = localStorage.getItem("token");
  const storedRole = localStorage.getItem("role");

  if (!token) {
    toast.error("Please login first!");
    router.push("/login");
    return;
  }

  if (storedRole === "admin" || storedRole === "user") {
    setTimeout(() => setRole(storedRole), 0);
  }
}, [router]);


  /* ============================
     FETCH BOOKINGS
  ============================ */
  const { data, refetch, isLoading } = useQuery<Booking[]>({
    queryKey: ["bookings"],
    queryFn: getBookings,
  });

  const createMutation = useMutation<
    CreateBookingResponse,
    Error,
    CreateBookingPayload
  >({
    mutationFn: createBooking,
    onSuccess: () => {
      toast.success("Booking created!");
      refetch();
    },
    onError: (err) => toast.error(err.message),
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


  function handleSubmit() {
    if (!startTime || !endTime) {
      toast.error("Please select start and end time");
      return;
    }

    if (endTime <= startTime) {
      toast.error("End time must be after start time");
      return;
    }

    createMutation.mutate({
      resource_id: resourceId,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
    });
  }


  return (
    <main className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-pink-50 p-10">
      <div className="max-w-2xl mx-auto">
        {/* Title + Role + Logout */}
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-800">
            Resource Booking System
          </h1>
          {role && (
            <button
              onClick={() => {
                localStorage.clear();
                toast.success("Logged out!");
                router.push("/login");
              }}
              className="text-sm px-4 py-2 rounded-xl bg-red-400 text-gray-200 hover:bg-gray-300"
            >
              Logout
            </button>
          )}
        </div>

        {role && (
          <p className="text-sm text-gray-500 mb-6">
            Logged in as:{" "}
            <span className="font-semibold text-indigo-600">{role}</span>
          </p>
        )}

        {/* Booking Form */}
        <div className="space-y-6 p-7 rounded-3xl shadow-lg bg-white/80 backdrop-blur border border-gray-200">
          <h2 className="text-lg font-semibold text-indigo-700">
            Create New Booking
          </h2>

          <select
            value={resourceId}
            onChange={(e) => setResourceId(Number(e.target.value))}
            className="w-full rounded-xl border text-gray-800 border-gray-300 p-3 focus:ring-2 focus:ring-indigo-400 outline-none"
          >
            <option value={1}>Meeting Room A</option>
            <option value={2}>Meeting Room B</option>
            <option value={3}>Projector</option>
          </select>

          <DateTimePicker
            label="Start Time"
            value={startTime}
            onChange={setStartTime}
          />
          <DateTimePicker
            label="End Time"
            value={endTime}
            onChange={setEndTime}
          />

          <button
            onClick={handleSubmit}
            disabled={createMutation.isPending}
            className="w-full py-3 rounded-xl font-semibold text-white 
            bg-linear-to-r from-indigo-600 to-pink-500 
            hover:opacity-90 transition disabled:opacity-50"
          >
            {createMutation.isPending ? "Booking..." : "Book Resource"}
          </button>
        </div>

        {/* Booking List */}
        <h2 className="text-2xl font-bold mt-14 mb-6 text-gray-800">
          Existing Bookings
        </h2>

        {isLoading && (
          <p className="text-gray-500 animate-pulse">Loading bookings...</p>
        )}

        {!isLoading && data?.length === 0 && (
          <p className="text-gray-500">No bookings yet. Create one above </p>
        )}

        <div className="space-y-4">
          {data?.map((b) => (
            <div
              key={b.id}
              className="p-6 rounded-2xl shadow-md bg-white border border-gray-200 
              flex justify-between items-center hover:shadow-lg transition"
            >
              <div>
                <p className="font-semibold text-gray-800">
                  Resource #{b.resource_id}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {formatDate(b.start_time)} → {formatDate(b.end_time)}
                </p>
                <div className="mt-3">
                  <StatusBadge status={b.status} />
                </div>
              </div>

              {/* Actions hanya admin */}
              {role === "admin" && (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => approveMutation.mutate(b.id)}
                    disabled={b.status !== "pending"}
                    className="px-4 py-2 rounded-xl bg-green-500 text-white font-medium 
                    hover:bg-green-600 disabled:opacity-40"
                  >
                    Approve
                  </button>

                  <button
                    onClick={() => cancelMutation.mutate(b.id)}
                    disabled={b.status === "cancelled"}
                    className="px-4 py-2 rounded-xl bg-red-500 text-white font-medium 
                    hover:bg-red-600 disabled:opacity-40"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
