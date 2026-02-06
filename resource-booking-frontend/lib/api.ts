import type {
  Booking,
  CreateBookingPayload,
  CreateBookingResponse,
} from "@/types/booking";

import type { LoginPayload, LoginResponse } from "@/types/auth";

const API_URL = "http://localhost:8080";

/* ============================
   TOKEN HELPERS
============================ */

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}


/* ============================
   LOGIN API
============================ */

function saveRole(role: string) {
  localStorage.setItem("role", role);
}

export async function loginUser(
  payload: LoginPayload
): Promise<LoginResponse> {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("Login failed");

  const data: LoginResponse = await res.json();

  localStorage.setItem("token", data.token);
  saveRole(data.role);

  return data;
}


/* ============================
   BOOKINGS API (Protected)
============================ */

export async function getBookings(): Promise<Booking[]> {
  const token = getToken();

  const res = await fetch(`${API_URL}/bookings`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to fetch bookings");

  return res.json();
}

export async function createBooking(
  payload: CreateBookingPayload
): Promise<CreateBookingResponse> {
  const token = getToken();

  const res = await fetch(`${API_URL}/bookings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to create booking");
  }

  return res.json();
}

/* ============================
   ADMIN ACTIONS
============================ */

export async function approveBooking(id: number): Promise<void> {
  const token = getToken();

  const res = await fetch(`${API_URL}/bookings/${id}/approve`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Approve failed");
}

export async function cancelBooking(id: number): Promise<void> {
  const token = getToken();

  const res = await fetch(`${API_URL}/bookings/${id}/cancel`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Cancel failed");
}
